
import {crypto} from 'openpgp';
import {bin2key} from '../encryption';
import Storage from './storage';


export default class User {

    constructor({email, lang, quota}) {
        this.email = email;
        this.lang = lang;
        this.quota = quota; // in bytes

        this.key = null;
    }

    /**
     * @return Promise<User>
     */
    static from_session(session) {
        return session.request({
            url: '/user',
            background: true,
            type: User
        });
    }

    static hash_password(password) {
        let u8a_password = crypto.hash.sha256(password);

        // Convert Uint8Array to hex string.
        return u8a_password.reduce((acc, i) => acc + ('0' + i.toString(16)).slice(-2), '');
    }

    list_storages(session) {
        return session.request({
            url: '/storages',
            background: true,
            type: Storage
        });
    }

    _fetch_key(session) {
        return session.get_file(`/keys/${this.email}.key`).then(bin2key);
    }

    get_key(session) {
        return this.key !== null ? Promise.resolve(this.key) :
            this._fetch_key(session).then(key => (this.key = key));
    }
}
