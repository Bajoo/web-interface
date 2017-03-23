
import m from 'mithril';


//const base_url = 'https://api.dev.bajoo.fr';
export const base_url = 'http://127.0.0.1:3000';
const base_storage_url = 'https://storage.dev.bajoo.fr';

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
    }

    static from_user_credentials(username, encrypted_password) {
        return m.request({
            method: 'POST',
            url: `${base_url}/token`,

            //user: client_id,
            //password: client_secret,

            data: {
                grant_type: 'password',
                username,
                password: encrypted_password
            },
            background: true,
            headers: {
                Authorization: `Basic ${btoa([client_id, client_password].join(':'))}`,
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            serialize: serialize_form_urlencoded,
            type: Session
        });
    }

    /**
     Do an authenticated request to the API
     */
    request(config) {
        if (config.url && config.url[0] == '/') {
            config.url = base_url + config.url;
            config.headers = config.headers || {};
            config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
            config.headers['Authorization'] = `Bearer ${this.access_token}`;
        }
        return m.request(config);
    }

    /**
     Do an authenticated request to the storage servers
     */
    storage_request(config) {
        if (config.url && config.url[0] == '/') {
            config.url = base_storage_url + config.url;
            config.headers = config.headers || {};
            config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
            config.headers['Authorization'] = `Bearer ${this.access_token}`;
        }
        return m.request(config);
    }
}
