
import {TaskStatus, default as BaseTask} from './base_task';
import User from '../models/user';
import app from '../app';
import {NoUserKeyError, PermissionUpdateFailed, StorageKeyError} from '../models/task_errors';


/**
 * Apply changes on storage member's permissions.
 *
 * A task is a list of permission to change, set or remove.
 */
export default class StorageMemberTask extends BaseTask {

    constructor(storage, diff_list, reset_key=false) {
        super();
        this.storage = storage;
        this.diff_list = diff_list;
        this.reset_key = reset_key;
    }

    /**
     * Return a few words describing the task.
     * @param [ltpl=String.raw] literal template (used for i18n)
     * @return {string}
     */
    get_description(ltpl=String.raw) {
        // TODO: display better description according to use cases:
        // - 'Add member "Alice" from "Share X"'
        // - 'Remove member "Bob" from "Share Y"'
        return ltpl`Update permissions and members of "${this.storage.name}"`;
    }

    get_scope() {
        return `/storage/${this.storage.id}`;
    }

    // jshint ignore:start
    async _start(task_manager) {
        this.set_status(TaskStatus.ONGOING);

        let storage = this.storage;
        let diff_list = this.diff_list;

        let self_member = null;
        let member_list = {
            ok: [],
            changed: [],
            new: [],
            deleted: []
        };

        for (let member of Object.values(diff_list.diff())) {
            if (member.email === app.user.email)
                self_member = member;
            else
                member_list[member.status].push(member);
        }

        let storage_key = null;
        let public_key_list = [];
        let rebuild_storage_key_needed = storage.is_encrypted && (
            this.reset_key || member_list.new.length || member_list.deleted.length ||
            (self_member && ['new', 'deleted'].includes(self_member.status)));

        if (rebuild_storage_key_needed) {
            if (!this.reset_key)
                storage_key = await this.unlock_storage(storage, app.user, task_manager.passphrase_input);
            else
                storage_key = await storage.generate_new_key();

            // 1. Fetch "base member" keys.
            // It the minimal set of key to not accidentally "exclude" someone from the storage.
            try {
                public_key_list = await Promise.all([...member_list.ok, ...member_list.changed].map(member =>
                    this._get_public_user_key(storage.session, member)
                ));

                if (self_member && self_member.status !== 'deleted') {
                    public_key_list.push(await this._get_public_user_key(storage.session, self_member));
                }
            } catch (err) {
                console.error('Storage member task failed: unable to fetch all base user keys.');
                throw err;
            }
        }

        // 2. delete members
        await Promise.all(member_list.deleted.map(member => {
            return storage.remove_member(member.email).catch(err => {
                console.warn('Member removal failed: ', member.email, ' : ', err);
                this.set_error(new PermissionUpdateFailed(this, this.storage, member.email, err));
            });
        }));

        // 3. Update changed members
        member_list.changed.map(member => {
            return storage.set_member(member.email, member.right).catch(err => {
                console.warn('Permission member update failed: ', member.email, ' : ', err);
                this.set_error(new PermissionUpdateFailed(this, this.storage, member.email, err));
            });
        });

        // 4. get keys of added members, then update permissions.
        let added_member_keys = await Promise.all(member_list.new.map(async member => {
            let pub_key = null;
            if (rebuild_storage_key_needed) {
                pub_key = await this._get_public_user_key(storage.session, member, true);
            }

            if (!storage.is_encrypted || pub_key) {
                try {
                    await storage.set_member(member.email, member.right);
                } catch (err) {
                    console.warn('Add member failed: ', member, ' : ', err);
                    this.set_error(new PermissionUpdateFailed(this, this.storage, member.email, err));
                }
            }
            return pub_key;
        }));

        if (rebuild_storage_key_needed) {
            public_key_list = public_key_list.concat(added_member_keys.filter(key => key));

            // 5. Prepare and upload a new PGP key
            try {
                await storage.encrypt_key(public_key_list, storage_key);
            } catch (err) {
                throw new StorageKeyError(this, this.storage, err);
            }
        }

        // 6. set app.user permissions.
        if (self_member) {
            try {
                switch (self_member.status) {
                    case 'new':
                    case 'changed':
                        await storage.set_member(self_member.email, self_member.right);
                        break;
                    case 'deleted':
                        await storage.remove_member(self_member.email);
                }
            } catch (err) {
                console.warn('Update self permission failed', err);
                throw new PermissionUpdateFailed(this, this.storage, self_member.email, err);
            }
        }
    }
    // jshint ignore:end

    _get_public_user_key(session, member, catch_err=false) {
        return User.get_public_key(session, member.email).catch(err => {
            console.warn(`Fetch user PGP key of "${member.email}" failed:`, member, err);
            err = new NoUserKeyError(this, member.email, err);
            if (catch_err)
                this.set_error(err);
            else
                throw err;
        });
    }
}
