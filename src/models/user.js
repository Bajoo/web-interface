
import {crypto} from 'openpgp';


export default class User {

    constructor({email, lang, quota}) {
        this.email = email;
        this.lang = lang;
        this.quota = quota; // in bytes
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
        var u8a_password = crypto.hash.sha256(password);

        // Convert Uint8Array to hex string.
        return u8a_password.reduce((acc, i) => acc + ('0' + i.toString(16)).slice(-2), '');
    }
}
