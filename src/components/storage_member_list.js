
import m from 'mithril';
import {_} from '../utils/i18n';


export default class StorageMemberList {

    constructor() {
        this.new_member = {
            email: '',
            right: 'read'
        };
    }

    /**
     * @param diff_list {DiffMemberList}
     * @param user {User}
     * @param allow_edit {boolean}
     */
    static make(diff_list, user, allow_edit) {
        return m(StorageMemberList, {diff_list, user, allow_edit});
    }

    /**
     * Display the list of each storage member.
     *
     * @param diff_list {DiffMemberList}
     * @param user {User} self user
     * @param allow_edit {boolean} is the user allowed to change permissions ?
     */
    view({attrs: {diff_list, user, allow_edit}}) {
        let diffed_members = diff_list.diff();
        let has_several_admins = this._has_several_admins(diff_list);

        return m('', [
            m('table#member-list.table.table-condensed.table-hover', [
                m('thead', m('tr', [
                    m('th', _('Email')),
                    m('th', _('Permission level')),
                    m('th', '')
                ])),
                m('tbody', [
                    Object.values(diffed_members).map(member => m('tr.member-row',
                        {class: this._row_class_view(member, user)}, [
                            m('td.email-member', member.email),
                            m('td', m('select.form-control.input-sm', {
                                disabled: member.status === 'deleted' || (!allow_edit) || (!has_several_admins && member.right === 'admin'),
                                onchange: evt => diff_list.set(member.email, evt.target.value)
                            }, [
                                m('option[value=read]', {selected: member.right === 'read'}, _('Read')),
                                m('option[value=write]', {selected: member.right === 'write'}, _('Write')),
                                m('option[value=admin]', {selected: member.right === 'admin'}, _('Admin'))
                            ])),
                            m('td', allow_edit ?
                                this._action_view(diff_list, member, user, (member.status !== 'deleted' && !has_several_admins && member.right === 'admin')) :
                                ''
                            )
                        ])),
                    allow_edit ? m('tr', [
                        m('td', m('input.form-control.input-sm[type=email]', {
                            value: this.new_member.email,
                            onchange: evt => this.new_member.email = evt.target.value,
                            onkeypress: evt => {
                                // Activate new member form on ENTER press.
                                // It's required because html doesn't support nested forms.

                                evt.redraw = false; // redraw would erase the form value.

                                let keycode = evt.keyCode ? evt.keyCode : evt.which;
                                if (keycode === 13) {
                                    this.new_member.email = evt.target.value;
                                    this._submit_new_member(diff_list, has_several_admins);
                                    evt.redraw = true;
                                    evt.preventDefault();
                                }
                            }
                        })),
                        m('td', m('select.form-control.input-sm', {
                            onchange: evt => this.new_member.right = evt.target.value,
                        }, [
                            m('option[value=read]', {selected: this.new_member.right === 'read'}, _('Read')),
                            m('option[value=write]', {selected: this.new_member.right === 'write'}, _('Write')),
                            m('option[value=admin]', {selected: this.new_member.right === 'admin'}, _('Admin'))
                        ])),
                        m('td', m('button[type=button].btn.btn-default', {
                            onclick: () => this._submit_new_member(diff_list, has_several_admins)
                        }, m('span.glyphicon.glyphicon-plus')))
                    ]) : ''
                ])
            ]),
            m('.small', _('Note: it must always remains at least one admin member.'))
        ]);
    }

    _submit_new_member(diff_list, has_several_admins) {
        if (!(/\S+@\S+\.\S+/.test(this.new_member.email)))
            return false;

        // always keep at least 1 admin
        if (!has_several_admins && this.new_member.right !== 'admin' && diff_list.get(this.new_member.email) === 'admin')
            return false;

        diff_list.set(this.new_member.email, this.new_member.right);
        this.new_member = {
            email: '',
            right: 'read'
        };
        return false;
    }

    _row_class_view(member, user) {
        let result = '';
        switch (member.status) {
            case 'changed':
                result = 'member-row-changed info';
                break;
            case 'new':
                result = 'member-row-changed success';
                break;
            case 'deleted':
                result = 'member-row-deleted danger';
                break;
        }
        if (user.email === member.email)
            result = `active ${result}`;
        return result;
    }


    /**
     * Detect if there is more than 1 admin, in the local (not yet active) permissions.
     *
     * @param diff_list {DiffMemberList}
     * @return {boolean} true if there is more than one admin; false otherwise
     */
    _has_several_admins(diff_list) {
        let nb_admin = 0;
        for (let p of Object.values(diff_list.members)) {
            if (p === 'admin') {
                nb_admin++;
                if (nb_admin === 2)
                    return true;
            }
        }
        return false;
    }

    _action_view(diff_list, member, user, disabled) {
        switch (member.status) {
            case 'ok':
            case 'changed':
            case 'new':
                return m('button[type=button].btn.btn-danger', {
                        disabled: disabled,
                        onclick: () => {
                            diff_list.del(member.email);
                            return false;
                        }
                    },
                    member.email === user.email ?
                        m('span.glyphicon.glyphicon-log-out') :
                        m('span.glyphicon.glyphicon-trash')
                );
            case 'deleted':
                return m('button[type=button].btn.btn-default', {
                        disabled: disabled,
                        onclick: () => {
                            diff_list.set(member.email, member.right);
                            return false;
                        }
                    },
                    m('span.glyphicon.glyphicon-plus')
                );
        }
    }
}
