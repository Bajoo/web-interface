
import {crypto} from 'openpgp';
import {bin2key} from '../encryption';
import StorageList from './storage_list';


export default class User {

    constructor(session, {email, lang, quota}) {
        this.session = session;

        this.email = email;
        this.lang = lang;
        this.quota = quota; // in bytes

        this.key = null;

        /** @type {?Promise<StorageList>} */
        this.promise = null;

        /** @type {undefined|?StorageList} */
        this.storages = undefined;

        /** @type {?Error} */
        this.error = null;

        /**
         * @type {?Function} callback, called when an error occurs.
         * It receives the error as argument.
         */
        this.onerror = null;
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

    static resend_activation_email(client_session, email) {
        return client_session.request({
            method: 'POST',
            url: '/user/:email/resend_activation_email',
            data: {email}
        });
    }

    load_storages() {
        if (this.promise) // reuse ongoing promise
            return this.promise;

        this.promise = StorageList.from_user_session(this).then(storage_list => {
            this.promise = null;
            this.error = null;
            this.storages = storage_list;
            return this.storages;
        }, err => {
            this.promise = null;
            this.error = err;
            this.storages = null;
            console.error('Fetching storage list failed', err);
            if (this.onerror)
                this.onerror(err);
            throw err;
        });
        return this.promise;
    }

    _fetch_key(session) {
        return session.get_file(`/keys/${this.email}.key`).then(bin2key);
    }

    get_key() {
        return this.key !== null ? Promise.resolve(this.key) :
            this._fetch_key(this.session).then(key => (this.key = key));
    }
}
