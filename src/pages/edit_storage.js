
import m from 'mithril';
import app from '../app';
import StatusAlert from '../components/status_alert';
import Storage from '../models/storage';
import {_, _l} from '../utils/i18n';
import Status from '../view_models/status';


export default class EditStorage {
    constructor(vnode) {
        this.storage = null;
        this.status = new Status();
        this.is_loading = true;

        // used to global error (storage not loading)
        this.wall_msg = null;

        Storage.get(app.session, vnode.attrs.key)
            .then(storage => this.storage = storage)
            .then(user_key => this.storage.initialize())
            .then(() => this.is_loading = false)
            .then(m.redraw)
            .catch(err => {
                this.is_loading = false;
                console.error(`Error when fetching storage "${vnode.attrs.key}"`, err);
                switch (true) {
                    case (err.code === 403):
                        this.wall_msg = _("You don't have the permission to see this share.");
                        break;
                    case (err.code === 404):
                    case (err.code === 400 && 'data' in err && 'storage_id' in err.data):
                        this.wall_msg = _('This share does not exist.');
                        break;
                    default:
                        this.status.set_error(err.message || err.toString());
                }
                m.redraw();
            });
    }

    view() {
        return m('', [
            m('h1.h3', this.storage ? _l`Edit ${this.storage.name}` : _('Edit share')),
            m('hr'),
            this.wall_msg ? m('.jumbotron.empty-box', m('p.text-danger', this.wall_msg)) :
                m('form', {onsubmit: () => this.submit()}, [
                    StatusAlert.make(this.status),
                    m('fieldset', { disabled: this.is_loading}, [
                        m('.form-group', [
                            m('label', _('Name')),
                            m('input.form-control[required]', {
                                placeholder: _('Eg: \"Pictures Holidays 2017\"'),
                                oninput: event => this.storage.name = event.target.value,
                                value: this.storage ? this.storage.name : ''
                            })
                        ]),
                        m('.form-group', [
                            m('label', _('Description')),
                            m('textarea.form-control',{
                                oninput: event => this.storage.description = event.target.value,
                                value: this.storage ? this.storage.description : ''
                            })
                        ]),
                        m('.checkbox', m('label', [
                            m('input[type=checkbox][readonly][disabled]', {
                                checked: this.storage ? this.storage.is_encrypted : ''
                            }),
                            _('Encrypt this share ?')
                        ])),
                        m('button[type="submit"].btn.btn-default', _('Submit'))
                    ]),
                ])
        ]);
    }

    submit() {
        this.is_loading = true;
        this.storage.save()
            .then(() => this.is_loading = false)
            .then(() => {
                this.status.set('success', _('The share has been updated.'));
                m.redraw();
            }, err => {
                this.is_loading = false;
                console.error('Storage edit failed', err);
                this.status.set_error(err.message || err.toString());
                m.redraw();
            });
    }
}
