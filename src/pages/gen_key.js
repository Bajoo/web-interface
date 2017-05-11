
import m from 'mithril';
import app from '../app';
import InputForm from '../components/input_form';
import {_, _l} from '../utils/i18n';
import prop from '../utils/prop';



export default class GenKeyPage {
    constructor() {
        this.is_loading = false;
        this.passphrase_error = null;
        this.confirm_error = null;
        this.passphrase = prop('');
        this.confirm = prop('');
        this.no_passphrase = false;

        this.error_message = null;
    }

    view() {
        return m('.modal.show[role=dialog][aria-labelledby=key-generation-modal]',
            m('.modal-dialog[role=document]', m('.modal-content', [
                m('.modal-header',
                    m('h4.modal-title#key-generation-modal', _('Creation of your encryption key'))
                ),
                m('.modal-body', [
                    this.error_message ? m('.alert .alert-danger', this.error_message) : '',

                    _("Before starting, we must create your encryption key. In order to do that, you need to define a passphrase."),
                    m('br'),
                    _("Your passphrase is known only by yourself. It's used to encrypt your data."), m('br'),
                    _("It should contains at least 8 characters."),
                    _("You can use a real phrase to memorize it more easily (ex: MyBajooAccount)."),
                    m('br'), m('br'),
                    m('form#passphrase-input-form', { onsubmit: () => this.submit()}, [
                        this.error ?
                            m('.alert .alert-danger', _("We're unable to decrypt the key. Bad passphrase ?")) :
                            '',
                        m('fieldset', { disabled: this.is_loading || this.no_passphrase}, [
                            m(InputForm, {id: 'passphrase', label: 'Passphrase', icon: 'lock', type: 'password',
                                value: this.passphrase, error: this.passphrase_error})
                        ]),
                        m('fieldset', { disabled: this.is_loading || this.no_passphrase}, [
                            m(InputForm, {id: 'confirm', label: 'Passphrase confirmation', icon: 'lock', type: 'password',
                                value: this.confirm, error: this.confirm_error})
                        ]),
                        m('.checkbox', m('label', [
                            m('input[type=checkbox]', {
                                checked: this.no_passphrase,
                                onchange: event => {
                                    this.no_passphrase = event.target.checked;
                                    m.redraw();
                                }}),
                            _("I don't want to use a passphrase")
                        ])),
                    ])
                ]),
                m('.modal-footer', [
                    m('button.btn.btn-primary[type=submit][form=passphrase-input-form]',
                        {disabled: this.is_loading}, _('Generate the key'))
                ])
            ]))
        );
    }

    submit() {
        this.confirm_error = null;
        this.passphrase_error = null;
        this.error_message = null;

        let passphrase = null;
        if (!this.no_passphrase) {
            passphrase = this.passphrase();
            if (this.passphrase().length < 8) {
                this.passphrase_error = _('The passphrase must have at least 8 characters');
                return;
            }
            if (this.passphrase() !== this.confirm()) {
                this.confirm_error = _("The passphrase and its confirmation doesn't match");
                return;
            }
        }

        this.is_loading = true;
        app.user.generate_key(app.user.email, passphrase).then(_ => m.route.set(app.redirect_to || '/'),
            err => {
                console.error('User key generation failed', err);
                this.error_message = _l`Key generation failed: ${err.message || err}`;
                this.is_loading = false;
                m.redraw();
            });
    }
}
