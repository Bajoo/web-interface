
import m from 'mithril';
import {base_url} from '../models/session';
import User from '../models/user';
import app from '../app';
import InputForm from '../components/input_form';
import prop from '../utils/prop';
import ActivationPage from './activation';


const forgotten_password_url = `${base_url}/user/password-forgotten`;


export default {
    oninit() {
        this.is_loading = false;
        this.error_message = null;
        this.username = prop();
        this.password = prop();
        this.stay_connected = false;

        this.redirect_to = app.redirect_to;
    },

    view() {
        return m('.panel.panel-default',
            m('.panel-heading', m('h1.panel-title', 'Connexion')),
            m('.panel-body', [
                m('form', { onsubmit: ()=> this.submit()}, [
                    this.error_message ? m('.alert .alert-danger', this.error_message) : '',
                    m('fieldset', { disabled: this.is_loading}, [
                        m(InputForm, {id: 'username', label: 'Username', icon: 'user', type: 'email', value: this.username}),
                        m(InputForm, {id: 'password', label: 'Password', icon: 'lock', type: 'password', value: this.password}),
                        m('.checkbox', m('label', [
                            m('input[type=checkbox]', {
                                checked: this.stay_connected,
                                onchange: event => this.stay_connected = event.target.checked}),
                            'Stay connected'
                        ])),
                        m('button[type="submit"].btn.btn-default', 'Submit')
                    ]),
                    m('br'),
                    m('a.small[href=/register]', {oncreate: m.route.link}, 'Create a new account'),
                    m(`a.pull-right.small[href="${forgotten_password_url}"]`, 'Forgotten password ?')
                ])
            ])
        );
    },

    submit() {
        this.is_loading = true;

        let password = User.hash_password(this.password());

        app.log_from_user_credentials(this.username(), password, this.stay_connected)
            .then(() => m.route.set(this.redirect_to || '/'))
            .catch(err => {
                if (err.error === 'account_not_activated') {
                    ActivationPage.go_to(this.username(), this.password(), this.stay_connected);
                    return;
                }
                this.is_loading = false;
                m.redraw();

                if (err.error === 'invalid_grant' && err.error_description === "Invalid credentials given.") {
                    this.error_message = 'Invalid username and/or password';
                    return;
                }
                console.error('Login failed', err);
                this.error_message = err.error_description || err.message || 'Unknown error';
            });
    }
};
