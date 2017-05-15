
import m from 'mithril';
import app from '../app';
import StatusAlert from '../components/status_alert';
import TaskView from '../components/tasks_view';
import Storage from '../models/storage';
import {_} from '../utils/i18n';
import Status from '../view_models/status';


export default {

    oninit() {
        this.is_loading = false;
        this.status = new Status();

        this.name = null;
        this.description = '';
        this.is_encrypted = true;
    },

    view() {
        return m('', [
            m('h1.h3', _('New share')),
            TaskView.make(app.task_manager),
            m('hr'),
            m('form', {onsubmit: () => this.submit()}, [
                StatusAlert.make(this.status),
                m('fieldset', { disabled: this.is_loading}, [
                    m('.form-group', [
                        m('label', _('Name')),
                        m('input.form-control[required]', {
                            placeholder: _('Eg: \"Pictures Holidays 2017\"'),
                            oninput: event => this.name = event.target.value,
                            value: this.name
                        })
                    ]),
                    m('.form-group', [
                        m('label', _('Description')),
                        m('textarea.form-control',{
                            oninput: event => this.description = event.target.value,
                            value: this.description
                        })
                    ]),
                    m('.checkbox', m('label', [
                        m('input[type=checkbox]', {
                            checked: this.is_encrypted,
                            onchange: event => this.is_encrypted = event.target.checked}),
                        _('Encrypt this share ?')
                    ])),
                    m('button[type="submit"].btn.btn-default', _('Submit'))
                ]),
            ])
        ]);
    },

    submit() {
        this.is_loading = true;

        this.status.clear();

        Storage.create(app.session, this.name, this.description, this.is_encrypted)
            .then(storage => m.route.set(`/storage/${storage.id}`))
            .catch(err => {
                this.is_loading = false;
                this.status.set_error(err.message || err);
                m.redraw();
                console.error('Container creation failed:', err);
            })
            .then(() => app.user.load_storages())  // Update storage list
            .then(m.redraw);
    }
};
