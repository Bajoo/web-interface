
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

        this._rights = rights;

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

    /**
     * Prepare the storage for use.
     *
     * Try to fetch the storage key. If there is no key, a new key is created.
     */
    async initialize() {
        try {
            await this._initialize();
        } catch(err) {
            console.error(`initialization storage #${this.id} failed`, err);
            throw new Error(`Initialization failed: ${err.message || err}`);
        }
    }

    async _initialize() {
        if (!this.is_encrypted)
            return;

        try {
            this._raw_key = await this.get_file('.key');
        } catch (err) {
            if (!('xhr' in err && err.xhr.status === 404))
                throw err;
            let permissions_list = await this.session.request({
                url: `/storages/:id/rights`,
                data: {
                    id: this.id
                }
            });
            let members = permissions_list.filter(x => x.scope === 'user').map(x => x.user);
            // TODO: handle partial error !!
            let public_keys = await Promise.all(members.map(member => User.get_public_key(this.session, member)));

            // NOTE: the key is not saved, to force the user to use its own key before upload.
            let key = await generate_key(`Bajoo storage "${this.name}"`, `bajoo-storage-${this.id}@bajoo.fr`);

            let raw_key = key2bin(key);
            let encrypted_key = await encrypt(raw_key, public_keys);
            await this.session.storage_request({
                url: `/storages/${this.id}/.key`,
                method: 'PUT',
                data: encrypted_key,
                serialize: x => x
            });
            this._raw_key = raw_key;
        }
    }

    list_files(folder = '') {
        return this.session.storage_request({
            url: `/storages/${this.id}`,
            data: { // GET params
                format: 'json',
                prefix: folder ? `${folder}/` : '',
                delimiter: '/'
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
}
