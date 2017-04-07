
import File from './file';
import {bin2key, decrypt} from '../encryption';


export default class Storage {

    constructor({id, name, description, is_encrypted, rights}) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.is_encrypted = is_encrypted;

        this._rights = rights;

        this.key = null;
    }

    static get(session, storage_id) {
        return session.request({
            url: `/storages/${storage_id}`,
            background: true,
            type: Storage
        });
    }

    list_files(session, folder = '') {
        return session.storage_request({
            url: `/storages/${this.id}`,
            data: { // GET params
                format: 'json',
                prefix: folder ? `${folder}/` : '',
                delimiter: '/'
            },
            bakground: true
        })
            .then(result => result.filter(item => item.name !== '.key'))
            .then(result => result.map(item => {  // Remove directory prefix
                if ('name' in item) {
                    return new File(this, item);
                }
                if ('subdir' in item) {
                    item.subdir = item.subdir.substr(0, item.subdir.length - 1).split('/').pop();
                }
                return item;
            }));
    }

    _fetch_key(session, user_key) {
        return session.get_file(`/storages/${this.id}/.key`)
            .then(data => decrypt(data, user_key))
            .then(bin2key);
    }

    get_key(session, user_key) {
        return this.key !== null ? Promise.resolve(this.key) :
            this._fetch_key(session, user_key).then(key => (this.key = key));
    }
}
