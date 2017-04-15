
import m from 'mithril';
import input_form from './input_form';


/**
 * Attributes:
 *  model {PassphraseInput}
 */
export default {
    view({attrs}) {
        return m('.modal[role=dialog][aria-labelledby=passphrase-input-modal]',
            { class: attrs.model.enabled ? 'show' : ''},
            m('.modal-dialog[role=document]', m('.modal-content', [
                m('.modal-header', [
                    m('button.close[aria-label=Close]', {onclick: () => attrs.model.cancel()},
                        m('span[aria-hidden=true]', m.trust('&times;'))
                    ),
                    m('h4.modal-title#passphrase-input-modal', 'Your passphrase is required')
                ]),
                m('.modal-body', [
                    'Please, enter your passphrase to decrypt your files.', m('br'), m('br'),

                    m('form#passphrase-input-form', { onsubmit: ()=> attrs.model.submit()}, [
                        attrs.model.error ?
                            m('.alert .alert-danger', "We're unable to decrypt the key. Bad passphrase ?") :
                            '',
                        m('fieldset', { disabled: attrs.model.wait_for_feedback}, [
                            m(input_form, {id: 'passphrase', label: 'Passphrase', icon: 'lock', type:'password', value: attrs.model.passphrase})
                        ])
                    ])
                ]),
                m('.modal-footer', [
                    m('button.btn.btn-default', {
                        disabled: attrs.model.wait_for_feedback,
                        onclick: () => attrs.model.cancel()
                    }, 'Cancel'),
                    m('button.btn.btn-primary[type=submit][form=passphrase-input-form]',
                        {disabled: attrs.model.wait_for_feedback, onclick: () => attrs.model.submit()}, 'Apply')
                ])
            ]))
        );
    }
};
