
import m from 'mithril';
import Session from '../models/session';
import User from '../models/user';
import InputForm from '../components/input_form';
import {get_lang, set_lang, list_lang, _} from '../utils/i18n';
import prop from '../utils/prop';
import ActivationPage from './activation';


export default {
    oninit() {
        this.is_loading = false;
        this.error_message = null;
        this.email = prop('');
        this.password = prop('');
        this.confirm_password = prop('');
        this.lang = get_lang();

        this.password_error = null;
        this.confirm_password_error = null;
    },

    view() {
        return m('.panel.panel-default',
            m('.panel-heading', m('h1.panel-title', _('Account creation'))),
            m('.panel-body', [
                m('form', { onsubmit: (evt)=> this.submit(evt)}, [
                    this.error_message ? m('.alert .alert-danger', this.error_message) : '',
                    m('fieldset', { disabled: this.is_loading}, [
                        m(InputForm, {id: 'email', label: _('Email'), icon: 'user', type: 'email', value: this.email}),
                        m(InputForm, {id: 'password', label: _('Password'), icon: 'lock', type: 'password',
                            value: this.password, error: this.password_error}),
                        m(InputForm, {id: 'confirm_password', label: _('Password confirmation'), icon: 'lock',
                            type: 'password', value: this.confirm_password, error: this.confirm_password_error}),
                        m('.form-group', [
                            m('label.control-label', _('Language')),
                            m('.input-group', [
                                m('span.input-group-addon', m('span.glyphicon.glyphicon-flag[aria-hidden="true"]')),
                                m('select[required].form-control', {
                                    onchange : event => this.lang = event.target.value
                                }, list_lang().map(([code, lang]) =>
                                    m('option', {value: code, selected: this.lang === code ? 'selected' : ''}, lang)
                                ))
                            ]),
                        ]),
                        m('button[type="submit"].btn.btn-default', _('Submit'))
                    ]),
                    m('br'),
                    m(`a.small[href=/login]`, {oncreate: m.route.link}, _("I've already an account"))
                ])
            ])
        );
    },

    submit() {
        this.error_message = null;
        this.confirm_password_error = null;
        this.password_error = null;

        if (this.password().length < 8) {
            this.password_error = _('The password must have at least 8 characters');
            return;
        }
        if (this.password() !== this.confirm_password()) {
            this.confirm_password_error = "The password and its confirmation doesn't match";
            return;
        }

        this.is_loading = true;

        Session.from_client_credentials()
            .then(session => User.register(session, this.email(), this.password(), this.lang))
            .then(_ => set_lang(this.lang))
            .then(user => ActivationPage.go_to(this.email(), this.password()))
            .catch(err => {
                this.error_message = err.toString();
                this.is_loading = false;
                m.redraw();
                console.error('User creation failed', err);
            });
    }
};
