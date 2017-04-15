
import m from 'mithril';
import {base_url} from '../models/session';
import User from '../models/user';
import app from '../app';
import input_form from '../components/input_form';
import prop from '../utils/prop';


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

    view(vscope) {
        return m('.panel.panel-default',
            m('.panel-heading', m('h1.panel-title', 'Connexion')),
            m('.panel-body', [
                m('form', { onsubmit: ()=> this.submit()}, [
                    this.error_message ? m('.alert .alert-danger', this.error_message) : '',
                    m('fieldset', { disabled: this.is_loading}, [
                        m(input_form, {id: 'username', label: 'Username', icon: 'user', type: 'email', value: this.username}),
                        m(input_form, {id: 'password', label: 'Password', icon: 'lock', type: 'password', value: this.password}),
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

                this.is_loading = false;
                if (err.error === 'invalid_grant' && err.error_description == "Invalid credentials given.")
                    this.error_message = 'Invalid username and/or password';
                else if (err.error_description)
                    this.error_message = err.error_description;
                else
                    this.error_message = err.message || 'Unknown error';
                m.redraw();
            });
    }
};
