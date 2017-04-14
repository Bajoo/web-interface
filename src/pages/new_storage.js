
import m from 'mithril';
import app from '../app';
import Storage from '../models/storage';


export default {

    oninit() {
        this.is_loading = false;
        this.error_message = '';

        this.name = null;
        this.description = '';
        this.is_encrypted = true;
    },

    view() {
        return m('.wall', [
            m('h1.h3', 'New share'),
            m('hr'),
            m('form', {onsubmit: () => this.submit()}, [
                this.error_message ? m('.alert .alert-danger', this.error_message) : '',
                m('fieldset', { disabled: this.is_loading}, [
                    m('.form-group', [
                        m('label', 'Name'),
                        m('input.form-control[required][placeholder="Eg: \"Pictures Holidays 2017\""]', {
                            oninput: event => this.name = event.target.value,
                            value: this.name
                        })
                    ]),
                    m('.form-group', [
                        m('label', 'Description'),
                        m('textarea.form-control',{
                            oninput: event => this.description = event.target.value,
                            value: this.description
                        })
                    ]),
                    m('.checkbox', m('label', [
                        m('input[type=checkbox]', {
                            checked: this.is_encrypted,
                            onchange: event => this.is_encrypted = event.target.checked}),
                        'Encrypt this share ?'
                    ])),
                    m('button[type="submit"].btn.btn-default', 'Submit')
                ]),
            ])
        ]);
    },

    submit() {
        this.is_loading = true;

        // TODO: storage key creation
        // TODO: add permissions
        // TODO: refresh global storage list.

        Storage.create(app.session, this.name, this.description, this.is_encrypted)
            .then(storage => {
                m.route.set(`/storage/${storage.id}`);
            }, err => {
                this.is_loading = false;
                this.error_message = 'message' in err ? err.message : err;
                m.redraw();
                console.error('Container creation failed:', err);
            });
    }
};
