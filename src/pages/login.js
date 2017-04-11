
import m from 'mithril';
import {base_url} from '../models/session';
import User from '../models/user';
import app from '../app';


const forgotten_password_url = `${base_url}/user/password-forgotten`;


export default {
    oninit() {
        this.is_loading = false;
        this.error_message = null;
        this.username = null;
        this.password = null;
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
                        m('.form-group', [
                            m('label', 'Username'),
                            m('.input-group', [
                                m('span.input-group-addon', m('span.glyphicon.glyphicon-user[aria-hidden="true"]')),
                                m('input[type=email][required].form-control', {
                                    oninput: event => this.username = event.target.value,
                                    value: this.username
                                })
                            ])
                        ]),
                        m('.form-group', [
                            m('label', 'Password'),
                            m('.input-group', [
                                m('span.input-group-addon', m('span.glyphicon.glyphicon-lock[aria-hidden="true"]')),
                                m('input[type="password"][required].form-control',{
                                    oninput: event => this.password = event.target.value,
                                    value: this.password
                                })
                            ])
                        ]),
                        m('.checkbox', m('label', [
                            m('input[type=checkbox]', {
                                checked: this.stay_connected,
                                onchange: event => this.stay_connected = event.target.checked}),
                            'Stay connected'
                        ])),
                        m('button[type="submit"].btn.btn-default', 'Submit')
                    ]),
                    m(`a.pull-right.small[href="${forgotten_password_url}"]`, 'Forgotten password ?')
                ])
            ])
        );
    },

    submit() {
        this.is_loading = true;

        let password = User.hash_password(this.password);

        app.log_from_user_credentials(this.username, password)
            .then(() => {
                if (this.stay_connected)
                    app.session.autosave();

                m.route.set(this.redirect_to || '/');
            })
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
