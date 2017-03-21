
import m from 'mithril';
import Session from '../models/session';
import User from '../models/user';
import layout from '../layout';
import app from '../app';



export default {
    oninit() {
        this.is_loading = false;
        this.error_message = null;
        this.username = null;
        this.password = null;
    },

    view(vscope) {
        return layout(this.view2(vscope));
    },

    view2(vscope) {
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
                                m('input[type="email"].form-control', {
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
                        m('button[type="submit"].btn.btn-default', 'Submit')
                    ])
                ])
            ])
        );
    },

    submit() {
        this.is_loading = true;

        let password = User.hash_password(this.password);

        Session.from_user_credentials(this.username, password)
            .then(session => {
                //this.is_loading = false;
                app.session = session;
                return User.from_session(session);
            }).then(user => {
                app.user = user;
                m.route.set('/');
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
