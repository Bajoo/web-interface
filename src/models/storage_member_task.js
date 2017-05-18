
import {TaskStatus, default as BaseTask} from './base_task';
import User from './user';
import app from '../app';


/**
 * Apply changes on storage member's permissions.
 *
 * A task is a list of permission to change, set or remove.
 */
export default class StorageMemberTask extends BaseTask {

    // app.user
    async start(storage, diff_list, passphrase_input) {
        try {
            return await this._start(storage, diff_list, passphrase_input);
        } catch (err) {
            this.progress = null;
            this.error = err;
            this.set_status(TaskStatus.ERROR);
            console.error(`Storage member changes failed`, err);
            throw err;
        }
    }

    async _start(storage, diff_list, passphrase_input) {
        /**
         * TODO: handle partial failure
         * TODO: display per-member progression (ex: 3/5).
         * TODO: set proper status
         */

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
            member_list.new.length || member_list.deleted.length ||
            (self_member && ['new', 'deleted'].includes(self_member.status)));

        if (rebuild_storage_key_needed) {
            storage_key = await this.unlock_storage(storage, app.user, passphrase_input);

            // 1. Fetch "base member" keys.
            // It the minimal set of key to not accidentally "exclude" someone from the storage.
            try {
                public_key_list = await Promise.all([...member_list.ok, ...member_list.changed].map(member => {
                    return User.get_public_key(storage.session, member.email);
                }));

                if (self_member && self_member.status !== 'deleted') {
                    public_key_list.push(await User.get_public_key(storage.session, self_member.email));
                }
            } catch (err) {
                console.error('Storage member task failed: unable to fetch all base user keys.', err);
                // TODO: status == ERR; proper error message.
                throw err;
            }
        }

        // 2. delete members
        await Promise.all(member_list.deleted.map(member => {
            return storage.remove_member(member.email).catch(err => {
                // TODO: status: partial error
                console.warn('Member removal failed: ', member.email, ' : ', err);
            });
        }));

        // 3. Update changed members
        member_list.changed.map(member => {
            return storage.set_member(member.email, member.right).catch(err => {
                // TODO: status: partial error
                console.warn('Permission member update failed: ', member.email, ' : ', err);
            })
        });

        if (rebuild_storage_key_needed) {
            // 4. get keys of added members, then update permissions.
            let added_member_keys = await Promise.all(member_list.new.map(async member => {
                try {
                    let pub_key = await User.get_public_key(storage.session, member.email);
                    await await storage.set_member(member.email, member.right);
                    return pub_key;
                } catch (err) {
                    // TODO: status: partial update
                    console.warn('Add member failed: ', member.email, ' : ', err);
                }
            }));
            public_key_list = public_key_list.concat(added_member_keys.filter(key => key));

            // 5. Prepare and upload a new PGP key
            await storage.encrypt_key(public_key_list, storage_key);
            // TODO: IF FAIL: container perms and keys may be inconsistent

        }

        // 6. set app.user permissions.
        if (self_member) {
            try {
                switch (self_member) {
                    case 'new':
                    case 'changed':
                        await storage.set_member(self_member.email, self_member.right);
                        break;
                    case 'deleted':
                        await storage.remove_member(self_member.email);
                }
            } catch (err) {
                console.warn('Update self permission failed', );
                // TODO: status: partial update
                // container perms and keys may be inconsistent
            }
        }
    }
}
