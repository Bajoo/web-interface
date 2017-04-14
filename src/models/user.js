
import {crypto} from 'openpgp';
import {bin2key} from '../encryption';
import cache from '../utils/cache';
import StorageList from './storage_list';


export default class User {

    constructor(session, {email, lang, quota}) {
        this.session = session;

        this.email = email;
        this.lang = lang;
        this.quota = quota; // in bytes

        this.key = null;
        this.storages = undefined;
    }

    /**
     * @return Promise<User>
     */
    static from_session(session) {
        return session.request({
            url: '/user'
        }).then(data => new User(session, data));
    }

    static hash_password(password) {
        let u8a_password = crypto.hash.sha256(password);

        // Convert Uint8Array to hex string.
        return u8a_password.reduce((acc, i) => acc + ('0' + i.toString(16)).slice(-2), '');
    }

    static register(client_session, email, password, lang = null) {
        return client_session.request({
            method: 'POST',
            url: '/users',
            data: {
                email,
                password: User.hash_password(password),
                lang
            }
        });
    }

    list_storages(reload=false) {
        return cache({target: this, attr: 'storages', reload}, () => StorageList.from_user_session(this));
    }

    _fetch_key(session) {
        return session.get_file(`/keys/${this.email}.key`).then(bin2key);
    }

    get_key() {
        return this.key !== null ? Promise.resolve(this.key) :
            this._fetch_key(this.session).then(key => (this.key = key));
    }
}
