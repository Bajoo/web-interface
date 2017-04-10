
export default {

    oninit(vnode) {
        this.pgp_key = vnode.attrs.pgp_key;
        this.callback = vnode.attrs.on_key_unlocked;

        this.show = true;
        this.is_loading = false;
        this.passphrase = '';
        this.error_message = null;
    },

    view() {
        return m('.modal[role=dialog][aria-labelledby=passphrase-input-modal]', { class: this.show ? 'show' : ''},
            m('.modal-dialog[role=document]', m('.modal-content', [
                m('.modal-header', [
                    m('button.close[aria-label=Close]', {onclick: () => this.cancel()},
                        m('span[aria-hidden=true]', m.trust('&times;'))
                    ),
                    m('h4.modal-title#passphrase-input-modal', 'Your passphrase is required')
                ]),
                m('.modal-body', [
                    'Please, enter your passphrase to decrypt your files.', m('br'), m('br'),

                    m('form#passphrase-input-form', { onsubmit: ()=> this.apply()}, [
                        this.error_message ? m('.alert .alert-danger', this.error_message) : '',
                        m('fieldset', { disabled: this.is_loading}, [
                            m('.form-group', [
                                m('label', 'Passphrase:'),
                                m('.input-group', [
                                    m('span.input-group-addon', m('span.glyphicon.glyphicon-lock[aria-hidden="true"]')),
                                    m('input[type=password][required].form-control', {
                                        oninput: event => this.passphrase = event.target.value,
                                        value: this.passphrase
                                    })
                                ])
                            ])
                        ])
                    ])

                ]),
                m('.modal-footer', [
                    m('button.btn.btn-default', {disabled: this.is_loading, onclick: () => this.cancel()}, 'Cancel'),
                    m('button.btn.btn-primary[type=submit][form=passphrase-input-form]',
                        {disabled: this.is_loading, onclick: () => this.apply()}, 'Apply')
                ])
            ]))
        );
    },

    cancel() {
        if (this.is_loading)
            return false;
        this.show = false;
    },

    apply() {
        this.is_loading = true;
        m.redraw();
        let success = false;//this.pgp_key.decrypt(this.passphrase);
        if (success) {
            this.show = false;
            this.callback();
        } else {
            this.error_message = "We're unable to decrypt the key. Bad passphrase ?";
            this.passphrase = '';
        }
        this.is_loading = false
    }

}
