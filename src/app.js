
import m from 'mithril';
import Session from './models/session';
import TaskManager from './models/task_manager';
import User from './models/user';
import {get_cookie, set_cookie, remove_cookie} from './utils/cookie';
import {set_lang} from './utils/i18n';


/**
 * Special singleton object
 *
 * All global reference are stored here. They can be set and used between pages.
 */
export default {
    /** @type {?Session} */
    session: null,

    /** @type {?User} */
    user: null,

    /**
     * If false, the user is not connected. If null, there is an ongoing connexion attempt, and the user may (or not)
     * be connected.
     * @type {?Boolean}
     */
    is_logged: null,

    /**
     * A list of key-value pairs, transmitted between pages. It's the way to give parameters to the next page, without
     * using URL parameters.
     *
     * @type {Object}
     */
    page_state: {},

    /**
     * If set, it's the URL that the user should be redirected after a login.
     * @type {?String}
     */
    redirect_to: null,

    /**
     * Global manager for long-running tasks.
     * @type {TaskManager}
     */
    task_manager: new TaskManager(),

    /**
     * Save a token in the cookies.
     * @param refresh_token {string}
     * @private
     */
    _save_token(refresh_token) {
        set_cookie('refresh_token', refresh_token);
    },

    /**
     * Log the user from existing cookie.
     *
     * It set both `user` and `session` attributes.
     *
     * @return {Promise} if there is a cookie, resolves when both session and user are restored. If there is no cookie,
     *  it resolves immediately.
     */
    log_from_cookie() {
        let refresh_token = get_cookie('refresh_token');

        if (refresh_token === '') {
            this.is_logged = false;
            return Promise.resolve(false);
        }

        return Session.from_refresh_token(refresh_token, this._save_token)
            .then(User.from_session)
            .then(user => {
                this.session = user.session;
                this.user = user;
                this.is_logged = true;
                set_lang(user.lang);
            }).catch(err => {
                this.is_logged = false;
                throw err;
            });
    },

    /**
     *
     * @param username {string}
     * @param password {string}
     * @param persistence {boolean} if `true`, makes the session persistent.
     * @return {Promise}
     */
    log_from_user_credentials(username, password, persistence) {
        let on_token_change = persistence ? this._save_token : null;
        return Session.from_user_credentials(username, password, on_token_change)
            .then(User.from_session)
            .then(user => {
                this.session = user.session;
                this.user = user;
                this.is_logged = true;
                set_lang(user.lang);
            }).catch(err => {
                this.is_logged = false;
                throw err;
            });
    },

    /**
     * Reset the session: Disconnect the user and returns to the login page.
     */
    reset() {
        remove_cookie('refresh_token');

        this.session.revoke();
        this.session = null;
        this.user = null;
        this.is_logged = false;
        m.route.set('/login');
    }
};
