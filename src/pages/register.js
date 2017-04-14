
import m from 'mithril';
import Session from '../models/session';
import User from '../models/user';




export default {
    oninit() {
        this.is_loading = false;
        this.error_message = null;
        this.email = null;
        this.password = null;
        this.confirm_password = null;
        this.lang = null;

        this.password_error = null;
        this.confirm_password_error = null;
    },

    view() {
        return m('.panel.panel-default',
            m('.panel-heading', m('h1.panel-title', 'Account creation')),
            m('.panel-body', [
                m('form', { onsubmit: ()=> this.submit()}, [
                    this.error_message ? m('.alert .alert-danger', this.error_message) : '',
                    m('fieldset', { disabled: this.is_loading}, [
                        m('.form-group', [
                            m('label.control-label', 'Email'),
                            m('.input-group', [
                                m('span.input-group-addon', m('span.glyphicon.glyphicon-user[aria-hidden="true"]')),
                                m('input[type=email][required].form-control', {
                                    oninput: event => this.email = event.target.value,
                                    value: this.email
                                })
                            ])
                        ]),
                        m('.form-group', {class: this.password_error ? 'has-error' : ''}, [
                            m('label.control-label', 'Password'),
                            m('.input-group', [
                                m('span.input-group-addon', m('span.glyphicon.glyphicon-lock[aria-hidden="true"]')),
                                m('input[type="password"][required].form-control', {
                                    oninput: event => this.password = event.target.value,
                                    value: this.password
                                })
                            ]),
                            this.password_error ? m('span.help-block', this.password_error) : ''
                        ]),
                        m('.form-group', {class: this.confirm_password_error ? 'has-error' : ''}, [
                            m('label.control-label', 'Password confirmation'),
                            m('.input-group', [
                                m('span.input-group-addon', m('span.glyphicon.glyphicon-lock[aria-hidden="true"]')),
                                m('input[type="password"][required].form-control', {
                                    oninput: event => this.confirm_password = event.target.value,
                                    value: this.confirm_password
                                })
                            ]),
                            this.confirm_password_error ? m('span.help-block', this.confirm_password_error) : ''
                        ]),
                        m('.form-group', [
                            m('label.control-label', 'Language'),
                            m('.input-group', [
                                m('span.input-group-addon', m('span.glyphicon.glyphicon-flag[aria-hidden="true"]')),
                                m('select[required].form-control', {
                                    onchange : event => this.lang = event.target.value,
                                    value: this.lang
                                }, [
                                    m('option[value=en]', 'English'),
                                    m('option[value=fr]', 'Français')
                                ])
                            ]),
                        ]),
                        m('button[type="submit"].btn.btn-default', 'Submit')
                    ]),
                    m('br'),
                    m(`a.small[href=/login]`, {oncreate: m.route.link}, "I've already an account")
                ])
            ])
        );
    },

    submit() {
        this.error_message = null;
        this.confirm_password_error = null;
        this.password_error = null;

        if (this.password.length < 8) {
            this.password_error = 'The password must have at least 8 characters';
            return;
        }
        if (this.password !== this.confirm_password) {
            this.confirm_password_error = "The password and its confirmation doesn't match";
            return;
        }

        this.is_loading = true;

        Session.from_client_credentials()
            .then(session => User.register(session, this.email, this.password, this.lang))
            .then(user => console.log(user)) // TODO: redirect to the 'wait passphrase' screen.
            .catch(err => {
                this.error_message = err.toString();
                this.is_loading = false;
                m.redraw();
                console.error('User creation failed', err);
            });

        // Step 3: wait activation.

        let password = User.hash_password(this.password);
    }
};
