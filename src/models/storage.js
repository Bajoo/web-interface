
import File from './file';
import Folder from './folder';
import {bin2key, decrypt} from '../encryption';


export default class Storage {

    constructor(session, {id, name, description, is_encrypted, rights}) {
        this.session = session;

        this.id = id;
        this.name = name;
        this.description = description;
        this.is_encrypted = is_encrypted;

        this._rights = rights;

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

    get_file(path) {
        return this.session.get_file(`/storages/${this.id}/${path}`);
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
}
