
import m from 'mithril';
import Session from './models/session';
import User from './models/user';


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
     * If set, it's the URL that the user should be redirected after a login.
     * @type {?String}
     */
    redirect_to: null,

    /**
     * Log the user from existing cookie.
     *
     * It set both `user` and `session` attributes.
     *
     * @return {Promise} if there is a cookie, resolves when both session and user are restored. If there is no cookie,
     *  it resolves immediately.
     */
    log_from_cookie() {
        return Session.from_cookies()
            .then(User.from_session)
            .then(user => {
                this.session = user.session;
                this.user = user;
                this.is_logged = true;
            }).catch(err => {
                // TODO: don't rethrow cookie error.
                this.is_logged = false;
                throw err;
            });
    },

    log_from_user_credentials(username, password) {
        return Session.from_user_credentials(username, password)
            .then(User.from_session)
            .then(user => {
                this.session = user.session;
                this.user = user;
                this.is_logged = true;
            }).catch(err => {
                this.is_logged = false;
                throw err;
            });
    },

    /**
     * Reset the session: Disconnect the user and returns to the login page.
     */
    reset() {
        this.session.disconnect();
        this.session = null;
        this.user = null;
        this.is_logged = false;
        m.route.set('/login');
    }
};
