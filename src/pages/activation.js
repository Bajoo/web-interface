
import m from 'mithril';
import app from '../app';
import Session from '../models/session';
import User from '../models/user';
import _ from '../utils/i18n';


/**
 * Expect 2 attributes "user" and "password" in app.page_state.
 * Can takes an optional attribute "stay_connected".
 */
export default class RegisterPage {
    constructor() {
        if (!('username' in app.page_state && 'password' in app.page_state)) {
            setTimeout(() => m.route.set('/login'), 0);
        }

        this.is_loading = false;
        this.error_message = '';

        this.username = app.page_state.username;
        this.password = app.page_state.password;
        this.stay_connected = app.page_state.stay_connected || false;
        app.page_state = {};
    }

    static go_to(username, password, stay_connected=false) {
        app.page_state = {username, password, stay_connected};
        m.route.set('/activation');
    }

    view() {
        return m('.panel.panel-default',
            m('.panel-heading', m('h1.panel-title', _('This account is not activated'))),
            m('.panel-body', [
                this.error_message ? m('.alert .alert-danger', this.error_message) : '',
                _("For continuing,  your must activate your account."), m('br'),
                _("You should receive in the next minutes, a confirmation email with an activation link."), m('br'),
                _("You must follow that link to continue."),
                m('hr'),
                m('', [
                    m('a.btn.btn-default.pull-left[href=/login]', {oncreate: m.route.link, disabled: this.is_loading}, _('Return to the login page')),
                    m('a.btn.btn-default.pull-right[href=/]', {disabled: this.is_loading, onclick: () => this.try_login()}, _("I've activated my account")),
                    m('p.text-center [href=/]', { disabled: this.is_loading, onclick: () => this.resend_email()}, m('a.small', _('Send again the activation email'))),
                ])
            ])
        );
    }

    resend_email() {
        if (this.is_loading)
            return false;
        this.is_loading = true;
        Session.from_client_credentials()
            .then(session => User.resend_activation_email(session, this.username))
            .then(_ => {
                this.is_loading = false;
                m.redraw();
            });
        return false;
    }

    try_login() {
        this.is_loading = true;
        this.error_message = '';

        let password = User.hash_password(this.password);
        app.log_from_user_credentials(this.username, password, this.stay_connected)
            .then(() => m.route.set('/'))
            .catch(err => {
                this.is_loading = false;
                console.error('Login (after activation) failed', err);
                this.error_message = err.error_description || err.message || _('Unknown error');
                m.redraw();
            });
        return false;
    }
}
