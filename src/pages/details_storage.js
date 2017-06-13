
import m from 'mithril';
import app from '../app';
import StatusAlert from '../components/status_alert';
import StorageMemberList from '../components/storage_member_list';
import Storage from '../models/storage';
import StorageMemberTask from '../tasks/storage_member_task';
import {_, _l} from '../utils/i18n';
import DiffMemberList from '../view_models/diff_member_list';
import Status from '../view_models/status';


export default class EditStorage {
    constructor(vnode) {
        this.storage = null;
        this.status = new Status();
        this.is_loading = true;

        // used to global error (storage not loading)
        this.wall_msg = null;

        this.diff_list = null;


        let scope_ref = decodeURIComponent(m.route.get());

        Storage.get(app.session, vnode.attrs.key)
            .then(storage => this.storage = storage)
            .then(() => this.storage.initialize())
            .then(() => this.storage.get_permissions())
            .then(() => {
                this.diff_list = new DiffMemberList(this.storage.permissions);

                this.is_loading = app.task_manager.get_tasks_impacted_by_scope(scope_ref).length > 0;

                app.task_manager.register_scope_callback(scope_ref, this, tasks => {
                    this.is_loading = tasks.length > 0;
                    this.storage.get_permissions().then(m.redraw, m.redraw);
                });

            })
            .then(m.redraw)
            .catch(err => {
                if (this.storage) {
                    this.is_loading = app.task_manager.get_tasks_impacted_by_scope(scope_ref).length > 0;

                    app.task_manager.register_scope_callback(scope_ref, this, tasks => {
                        this.is_loading = tasks.length > 0;
                        this.storage.get_permissions().then(m.redraw, m.redraw);
                    });
                } else {
                    this.is_loading = false;
                }


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

    onremove() {
        app.task_manager.unregister_scope_callback(this);
    }

    /**
     * Display the 'Submit', 'Leave' and 'Quit' button.
     */
    _control_btn_view(is_my_bajoo, allow_edit) {
        let leaving_allowed = this.storage && this.storage.permissions !== null &&
            !is_my_bajoo &&
            (
                !this.storage.rights.admin ||
                this.storage.permissions.filter(x => x.scope === 'user' && x.admin).length > 1
            );
        return [
            allow_edit ? m('button[type="submit"].btn.btn-default', _('Submit')) : '',
            !is_my_bajoo ? [
                m('hr'),
                allow_edit ? m('button[type=button].btn.btn-danger', {onclick: () => this._delete_storage()}, _('Delete this share')) : '',
                ' ',
                leaving_allowed ? m('button[type=button].btn.btn-danger', {onclick: () => this._leave_storage()}, _('Leave this share')) : ''
            ]: ''
        ];
    }


    /**
     * Display the main content
     */
    _content_view() {
        let is_my_bajoo = this.storage && this.storage.name === 'MyBajoo';
        let allow_edit = this.storage && this.storage.rights.admin && !is_my_bajoo;

        return m('form', {onsubmit: () => {this.submit(); return false;}}, [
            m('.checkbox', m('label', [
                m('input[type=checkbox][readonly][disabled]', {
                    checked: this.storage && this.storage.is_encrypted
                }),
                this.storage ? (this.storage.is_encrypted ?
                    _('This share is encrypted') :
                    _('This share is not encrypted')) : ''
            ])),
            StatusAlert.make(this.status),
            m('fieldset', {disabled: this.is_loading}, [
                m('.form-group', [
                    m('label', _('Name')),
                    allow_edit ? m('input.form-control[required]', {
                        placeholder: _('Eg: \"Pictures Holidays 2017\"'),
                        oninput: event => this.storage.name = event.target.value,
                        value: this.storage ? this.storage.name : ''
                    }) : m('', this.storage ? this.storage.name : '')
                ]),
                m('.form-group', [
                    m('label', _('Description')),
                    allow_edit ? m('textarea.form-control', {
                        oninput: event => this.storage.description = event.target.value,
                        value: this.storage ? this.storage.description : ''
                    }) : m('', this.storage ? this.storage.description : '')
                ]),
                m('.form-group', [
                    m('label', _('Member list')),
                    this.diff_list ?
                        StorageMemberList.make(this.diff_list, app.user, allow_edit) :
                        m('', _('Loading ...'))
                ]),
                this._control_btn_view(is_my_bajoo, allow_edit)
            ]),
        ]);
    }

    view() {
        return m('', [
            m('h1.h3', this.storage ? _l`Details of ${this.storage.name}` : _('Share details')),
            m('hr'),
            this.wall_msg ?
                m('.jumbotron.empty-box', m('p.text-danger', this.wall_msg)) :
                this._content_view()
        ]);
    }

    // jshint ignore:start
    async submit() {
        this.is_loading = true;

        try {
            await this.storage.save();
        } catch (err) {
            console.error('Update storage data failed', err);
            this.status.set_error(_l`Update storage data failed: ${err.message || err.toString()}`);
            this.is_loading = false;
            m.redraw();
            return;
        }

        try {
            let task = new StorageMemberTask(this.storage, this.diff_list);
            await app.task_manager.start(task);
        } catch (err) {
            return;
        } finally {
            await this.storage.get_permissions();
            this.diff_list.permissions = this.storage.permissions;
            this.is_loading = false;
            m.redraw();
        }

        this.status.set('success', _('The share has been updated.'));
        this.is_loading = false;
        m.redraw();
    }
    // jshint ignore:end

    _delete_storage() {
        if (!window.confirm(_('Are you sure you want to delete this share ?')))
            return false;

        this.is_loading = true;
        this.storage.delete().then(_ => m.route.set('/'), err => {
            console.error('Storage deletion failed', err);
            this.status.set_error(_(`The share deletion has failed: ${err.message || err}`));
            this.is_loading = false;
            m.redraw();
        });
        return false;
    }

    _leave_storage() {
        if (!window.confirm(_('Are you sure you want to leave this share ?')))
            return false;

        this.is_loading = true;
        this.storage.remove_member(app.user.email).then(_ => m.route.set('/'), err => {
            console.error('Storage leaving failed', err);
            this.status.set_error(_(`Leaving this share has failed: ${err.message || err}`));
            this.is_loading = false;
            m.redraw();
        });
        return false;
    }

}
