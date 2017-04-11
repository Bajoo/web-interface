
import {crypto} from 'openpgp';
import {bin2key} from '../encryption';
import cache from '../helpers/cache';
import Storage from './storage';


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
            url: '/user',
            background: true
        }).then(data => new User(session, data));
    }

    static hash_password(password) {
        let u8a_password = crypto.hash.sha256(password);

        // Convert Uint8Array to hex string.
        return u8a_password.reduce((acc, i) => acc + ('0' + i.toString(16)).slice(-2), '');
    }

    list_storages(reload=false) {
        return cache({target: this, attr: 'storages', reload}, () => this.session.request({
            url: '/storages',
            background: true,
        })).then(data => data.map(s => new Storage(this.session, s))).then(Array.from);
    }

    _fetch_key(session) {
        return session.get_file(`/keys/${this.email}.key`).then(bin2key);
    }

    get_key() {
        return this.key !== null ? Promise.resolve(this.key) :
            this._fetch_key(this.session).then(key => (this.key = key));
    }
}
