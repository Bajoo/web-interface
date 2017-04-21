
import m from 'mithril';
import InputForm from './input_form';


export default class PassphraseInputModal {

    /**
     * @param passphrase_input {PassphraseInput}
     */
    static make(passphrase_input) {
        return m(PassphraseInputModal, {model: passphrase_input});
    }

    /**
     * @param model {PassphraseInput}
     */
    view({attrs: {model}}) {
        return m('.modal[role=dialog][aria-labelledby=passphrase-input-modal]',
            { class: model.enabled ? 'show' : ''},
            m('.modal-dialog[role=document]', m('.modal-content', [
                m('.modal-header', [
                    m('button.close[aria-label=Close]', {onclick: () => model.cancel()},
                        m('span[aria-hidden=true]', m.trust('&times;'))
                    ),
                    m('h4.modal-title#passphrase-input-modal', 'Your passphrase is required')
                ]),
                m('.modal-body', [
                    'Please, enter your passphrase to decrypt your files.', m('br'), m('br'),

                    m('form#passphrase-input-form', { onsubmit: ()=> model.submit()}, [
                        model.error ?
                            m('.alert .alert-danger', "We're unable to decrypt the key. Bad passphrase ?") :
                            '',
                        m('fieldset', { disabled: model.wait_for_feedback}, [
                            m(InputForm, {id: 'passphrase', label: 'Passphrase', icon: 'lock', type: 'password',
                                value: model.passphrase})
                        ])
                    ])
                ]),
                m('.modal-footer', [
                    m('button.btn.btn-default', {
                        disabled: model.wait_for_feedback,
                        onclick: () => model.cancel()
                    }, 'Cancel'),
                    m('button.btn.btn-primary[type=submit][form=passphrase-input-form]',
                        {disabled: model.wait_for_feedback, onclick: () => model.submit()}, 'Apply')
                ])
            ]))
        );
    }
}
