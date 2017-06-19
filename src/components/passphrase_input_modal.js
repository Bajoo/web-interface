
import m from 'mithril';
import {_} from '../utils/i18n';
import InputForm from './input_form';
import Modal from './modal';


export default class PassphraseInputModal {

    /**
     * Create a PassphraseInputModal (only if `passphrase_input.enabled` is true).
     * @param passphrase_input {PassphraseInput}
     */
    static make(passphrase_input) {
        return passphrase_input.enabled ? m(PassphraseInputModal, {model: passphrase_input}) : '';
    }

    /**
     * @param model {PassphraseInput}
     */
    view({attrs: {model}}) {
        return Modal.make(v => typeof v === 'undefined' ? model.enabled : model.enabled = v,
            _('Your passphrase is required'), 'passphrase-input-modal', [
                _('Please, enter your passphrase to encrypt or decrypt your files.'), m('br'), m('br'),

                m('form#passphrase-input-form', { onsubmit: () => {model.submit(); return false;} }, [
                    model.error ?
                        m('.alert .alert-danger', _("We're unable to decrypt the key. Bad passphrase ?")) :
                        '',
                    m('fieldset', { disabled: model.wait_for_feedback}, [
                        m(InputForm, {id: 'passphrase', label: _('Passphrase'), icon: 'lock', type: 'password',
                            value: model.passphrase, autofocus: true})
                    ])
                ])
            ], [
                m('button.btn.btn-default[type=button][form=passphrase-input-form]', {
                    disabled: model.wait_for_feedback,
                    onclick: () => model.cancel()
                }, _('Cancel')),
                m('button.btn.btn-primary[type=submit][form=passphrase-input-form]',
                    {disabled: model.wait_for_feedback}, _('Apply'))
            ]);
    }
}
