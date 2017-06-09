
import File from './file';
import Folder from './folder';
import User from './user';
import {bin2key, encrypt, decrypt, generate_key, key2bin} from '../encryption';


export default class Storage {

    constructor(session, {id, name, description, is_encrypted, rights}) {
        this.session = session;

        this.id = id;
        this.name = name;
        this.description = description;
        this.is_encrypted = is_encrypted;

        this.rights = rights;

        /** @type {?Array} */
        this.permissions = null;

        this._raw_key = null;
        this.key = null;
    }

    static get(session, storage_id) {
        return session.request({
            url: `/storages/${storage_id}`
        }).then(data => new Storage(session, data));
    }

    static create(session, name, description, is_encrypted) {
        return session.request({
            method: 'POST',
            url: '/storages',
            data: {
                name, description, is_encrypted
            }
        }).then(data => new Storage(session, data));
    }

    get_permissions() {
        return this.session.request({
            url: `/storages/:id/rights`,
            data: {
                id: this.id
            }
        }).then(result => this.permissions = result);
    }

    /**
     * Prepare the storage for use.
     *
     * Try to fetch the storage key. If there is no key, a new key is created.
     */
    // jshint ignore:start
    async initialize() {
        try {
            await this._initialize();
        } catch(err) {
            console.error(`initialization storage #${this.id} failed`, err);
            throw new Error(`Initialization failed: ${err.message || err}`);
        }
    }
    // jshint ignore:end

    // jshint ignore:start
    async _initialize() {
        if (!this.is_encrypted)
            return;

        try {
            this._raw_key = await this.get_file('.key');
        } catch (err) {
            if (!('xhr' in err && err.xhr.status === 404))
                throw err;
            let permissions_list = await this.get_permissions();
            let members = permissions_list.filter(x => x.scope === 'user').map(x => x.user);
            // TODO: handle partial error !!
            let public_keys = await Promise.all(members.map(member => User.get_public_key(this.session, member)));

            // NOTE: the key is not saved, to force the user to use its own key before upload.
            let key = await this.generate_new_key();

            this.encrypt_key(public_keys, key);
        }
    }
    // jshint ignore:end

    /**
     * Low-level method, generating a new PGP key.
     *
     * The key is not uploaded nor encrypted.
     * @return {Promise.<openpgp.key>}
     */
    generate_new_key() {
        return generate_key(`Bajoo storage "${this.name}"`, `bajoo-storage-${this.id}@bajoo.fr`);
    }

    // jshint ignore:start
    async encrypt_key(public_keys, key) {
        let bin_key = key2bin(key);

        this._raw_key = await encrypt(bin_key, public_keys);
        await this.session.storage_request({
            url: `/storages/${this.id}/.key`,
            method: 'PUT',
            data: this._raw_key,
            serialize: x => x
        });
    }
    // jshint ignore:end

    list_files(folder = '', recursive=false) {
        return this.session.storage_request({
            url: `/storages/${this.id}`,
            data: { // GET params
                format: 'json',
                prefix: folder ? `${folder}/` : '',
                delimiter: recursive ? null : '/'
            }
        })
            .then(result => result.filter(item => item.name !== '.key'))
            .then(result => result.map(item => {  // Remove directory prefix
                if ('name' in item) {
                    return new File(this, item);
                }
                if ('subdir' in item) {
                    return new Folder(this, item);
                }
                return item;
            }));
    }

    get_file(path, progress=null) {
        return this.session.get_file(`/storages/${this.id}/${path}`, progress);
    }

    _fetch_key(user_key) {
        return this.get_file('.key')
            .then(data => decrypt(data, user_key))
            .then(bin2key);
    }

    get_key(user_key) {
        return this.key !== null ? Promise.resolve(this.key) :
            this._fetch_key(user_key).then(key => (this.key = key));
    }

    /**
     * Save name and description attributes
     * @return {Promise}
     */
    save() {
        return this.session.request({
            method: 'PATCH',
            url: `/storages/${this.id}`,
            data: {
                name: this.name,
                description: this.description
            }
        });
    }

    set_member(email, permission) {
        return this.session.request({
            method: 'PUT',
            url: `/storages/${this.id}/rights/users/${email}`,
            data: {
                read: true,
                write: permission === 'admin' || permission === 'write',
                admin: permission === 'admin'
            }
        });
    }

    remove_member(email) {
        return this.session.request({
            method: 'PUT',
            url: `/storages/${this.id}/rights/users/${email}`,
            data: {
                read: false,
                write: false,
                admin: false
            }
        });
    }

    delete() {
        return this.session.request({
            method: 'DELETE',
            url: `/storages/${this.id}`
        });
    }
}
