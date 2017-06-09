
import m from 'mithril';
import app from '../app';
import StatusAlert from '../components/status_alert';
import StorageMemberList from '../components/storage_member_list';
import Storage from '../models/storage';
import StorageMemberTask from '../tasks/storage_member_task';
import {_} from '../utils/i18n';
import DiffMemberList from '../view_models/diff_member_list';
import Status from '../view_models/status';


export default {

    oninit() {
        this.is_loading = false;
        this.status = new Status();

        this.name = null;
        this.description = '';
        this.is_encrypted = true;

        this.member_list = DiffMemberList.make_new(app.user.email);
    },

    view() {
        return m('', [
            m('h1.h3', _('New share')),
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
                    m('.form-group', [
                        m('label', _('Member list')),
                        StorageMemberList.make(this.member_list, app.user, true)
                    ]),
                    m('button[type="submit"].btn.btn-default', _('Submit'))
                ]),
            ])
        ]);
    },

    submit() {
        this.is_loading = true;

        this.status.clear();

        Storage.create(app.session, this.name, this.description, this.is_encrypted)
            .catch(err => {
                this.is_loading = false;
                this.status.set_error(err.message || err);
                m.redraw();
                console.error('Container creation failed:', err);
            })
            .then(storage => app.task_manager
                // If this task fails, the storage is still created but not all permissions are valid.
                .start(new StorageMemberTask(storage, this.member_list, true))
                .then(_ => m.route.set(`/storage/${storage.id}/browse`))
                .catch(err => m.route.set(`/storage/${storage.id}/details`))
            )
            .then(() => app.user.load_storages())  // Update storage list
            .then(m.redraw);
        return false;
    }
};
