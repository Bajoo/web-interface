
import m from 'mithril';


//const base_url = 'https://api.dev.bajoo.fr';
export const base_url = 'https://api.dev.bajoo.fr';
const base_storage_url = 'https://storage.dev.bajoo.fr/v1';

const client_id = 'e2676e5d1fff42f7b32308e5eca3c36a';
const client_password = '<client-secret>';


//TODO: it may be not needed.
function serialize_form_urlencoded(data) {
    let urlEncodedDataPairs = [];

    // Turn the data object into an array of URL-encoded key/value pairs.
    for (let name in data) {
        urlEncodedDataPairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
    }

    // Combine the pairs into a single string and replace all %-encoded spaces to 
    // the '+' character; matches the behaviour of browser form submissions.
    return urlEncodedDataPairs.join('&').replace(/%20/g, '+');
}

/**
 Singleton
 */
export default class Session {

    constructor({access_token, refresh_token}) {

        this.access_token = access_token;
        this.refresh_token = refresh_token;
        this.auto_save = false;
    }

    /*
     Do a requets asking for a new token (generic method).
     */
    static _token_request(data) {
        return m.request({
            method: 'POST',
            url: `${base_url}/token`,

            //user: client_id,
            //password: client_secret,

            data: data,
            background: true,
            headers: {
                Authorization: `Basic ${btoa([client_id, client_password].join(':'))}`,
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            serialize: serialize_form_urlencoded,
            type: Session
        });
    }
    
    static from_cookies() {
        let refresh_token = document.cookie.replace(/(?:(?:^|.*;\s*)refresh_token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
        if (refresh_token) {
            return this._token_request({
                grant_type: 'refresh_token',
                refresh_token: refresh_token
            }).then(session => {
                session.autosave();
                return session;
            });
        }
        return Promise.reject('No cookie');
    }
    
    static from_user_credentials(username, encrypted_password) {
        return this._token_request({
            grant_type: 'password',
            username,
            password: encrypted_password
        });
    }
    
    _refresh_token() {
        return this.constructor._token_request({
            grant_type: 'refresh_token',
            refresh_token: this.refresh_token
        }).then(new_session => {
            this.refresh_token = new_session.refresh_token;
            this.access_token = new_session.access_token;
            if (this.auto_save) {
                document.cookie = `refresh_token=${this.refresh_token}`;
            }
        });
    }

    _auth_request(base_url, config) {
        if (config.url && config.url[0] == '/') {
            config.url = base_url + config.url;
        }
        config.headers = config.headers || {};
        config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
        config.headers['Authorization'] = `Bearer ${this.access_token}`;
        
        return m.request(config).catch(err => {
            if (err.code === 401002) { //Token expired
                console.log('token expired; refreshing ...');
                return this._refresh_token().then(() => this.request(config));
            }
            throw err;
        });
    }

    /**
     Do an authenticated request to the API
     */
    request(config) {
        return this._auth_request(base_url, config);
    }

    /**
     Do an authenticated request to the storage servers
     */
    storage_request(config) {
        return this._auth_request(base_storage_url, config);
    }
    
    /*
      Save the token in cookies, and automatically re-save them on refresh.
     */
    autosave() {
        this.auto_save = true;
        document.cookie =  `refresh_token=${this.refresh_token}`;
    }
    
    disconnect() {
        // TODO: revoke token for a real disconnection.
        document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}
