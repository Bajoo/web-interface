
import m from 'mithril';
import {api_url, storage_url, client_id, client_password} from '../../config.js';



/**
 * Session of a Bajoo user.
 *
 * It handles everything related to authentication: connection, disconnection, and authenticated HTTP requests.
 *
 * The `on_token_change` argument is a callback, called each time the refresh_token changes. It can be used to save it
 * and restore it latter.
 */
export default class Session {

    constructor({access_token, refresh_token}, on_token_change = null) {

        this.access_token = access_token;
        this.refresh_token = refresh_token;
        this.on_token_change = on_token_change;

        if (this.on_token_change)
            this.on_token_change(refresh_token);
    }

    /**
     * Do a request asking for a new token (generic method).
     * @param data {Object} GET data payload, specific to the auth mechanism chosen.
     * @return {Object} object containing both refresh and access tokens.
     * @private
     */
    static _token_request(data) {
        return m.request({
            method: 'POST',
            url: `${api_url}/token`,

            //user: client_id,
            //password: client_secret,

            data: data,
            background: true,
            headers: {
                Authorization: `Basic ${btoa([client_id, client_password].join(':'))}`,
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            serialize: m.buildQueryString,
        });
    }

    static from_refresh_token(refresh_token, on_token_change = null) {
        return this._token_request({
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        }).then(data => new Session(data, on_token_change));
    }

    static from_user_credentials(username, encrypted_password, on_token_change = null) {
        return this._token_request({
            grant_type: 'password',
            username,
            password: encrypted_password
        }).then(data => new Session(data, on_token_change));
    }

    static from_client_credentials() {
        return this._token_request({grant_type: 'client_credentials'}).then(data => new Session(data));
    }

    _refresh_token() {
        return this.constructor.from_refresh_token(this.refresh_token)
            .then(new_session => {
                this.refresh_token = new_session.refresh_token;
                this.access_token = new_session.access_token;
                if (this.on_token_change)
                    this.on_token_change(this.refresh_token);
            });
    }

    _auth_request(base_url, config) {
        if (config.url && config.url[0] === '/') {
            config.url = base_url + config.url;
        }
        if (!('background' in config))
            config.background = true;
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${this.access_token}`; // jshint ignore:line

        return m.request(config).catch(err => {
            if (this.refresh_token && err.code === 401002 ||  //Token expired from api.bajoo.fr
                ('error' in err && err.error.code === 401)) { //Error from storage.bajoo.fr
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
        return this._auth_request(api_url, config);
    }

    /**
     Do an authenticated request to the storage servers
     */
    storage_request(config) {
        return this._auth_request(storage_url, config);
    }

    /**
     * Download a file
     * @param {String} url
     * @param {Function} progress
     * @return {Promise<Uint8Array>}
     * @throws {Error} error containing both 'response' and 'xhr' attributes.
     *   The `response` attribute is parsed (ie: JSON or String).
     */
    get_file(url, progress) {
        return this.storage_request({
            url,
            config: xhr => {
                xhr.responseType = 'arraybuffer';
                if (progress) {
                    xhr.addEventListener('progress', progress);
                }
            },
            extract: xhr => {
                if (xhr.status > 400) {  // try to parse result in case of error.
                    let response = xhr.response;
                    let error = new Error('Download file failed');
                    error.xhr = xhr;
                    try {
                        response = (new TextDecoder('utf8')).decode(new DataView(xhr.response));
                        response = JSON.parse(response);
                        for (let key in response)
                            if (response.hasOwnProperty(key))
                                error[key] = response[key];
                    } catch(err) {}
                    error.response = response;
                    throw error;
                }
                return new Uint8Array(xhr.response);
            }
        });
    }

    /**
     * Revoke the current session tokens. After this call, the session can't be used anymore.
     */
    revoke() {
        m.request({
            method: 'POST',
            url: `${api_url}/token/revoke`,
            data: {token: this.refresh_token},
            background: true,
            headers: {
                Authorization: `Basic ${btoa([client_id, client_password].join(':'))}`,
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            serialize: m.buildQueryString,
            extract: xhr => xhr.responseText
        }).catch(err => console.error('Error during token revocation', err));
        this.refresh_token = null;
        this.access_token = null;
    }
}
