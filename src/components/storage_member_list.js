
import m from 'mithril';
import {_} from '../utils/i18n';


export default class StorageMemberList {

    /**
     * component constructor
     *
     * permission is a list of object containing:
     * - scope: the permission scope. Other than "user" are ignored.
     * - user: the user's email
     * - admin: admin permission
     * - write: write permission
     * - read: read permission
     *
     * @param permissions {Object[]}
     */
    constructor({attrs: {permissions}}) {

        /**
         * Map of members. Each key is an email, and each value is one of "read", "write" or "admin".
         *
         * Local changes are done on this map, before submission.
         */
        this.members = permissions.reduce((acc, p) => {
            if (p.scope === 'user')
                acc[p.user] = p.admin ? 'admin' : p.write ? 'write' : 'read';
            return acc;
        }, {});

        this.new_member = {
            email: '',
            right: 'read'
        };
    }

    /**
     * @param permissions {Object[]}
     * @param user {User}
     * @param allow_edit {boolean}
     */
    static make(permissions, user, allow_edit) {
        return m(StorageMemberList, {permissions, user, allow_edit});
    }
    /**
     * Make a "diff" between the internal member list and the official permissions.
     *
     * Return a map of all users present at least in one of the both lists.
     * Each key is an email, and the value is an object containing:
     * - email: the member email
     * - right: the member permission
     * - status: one of "added", "ok", "changed" or "deleted"
     *
     * @param permissions {Object[]}
     * @return {Object}
     * @private
     */
    _diff(permissions) {
        let merged_list = permissions.reduce((acc, current) => {
            if (current.scope === 'user') {
                acc[current.user] = {
                    status: 'deleted',
                    email: current.user,
                    right: current.admin ? 'admin' : current.write ? 'write' : 'read'
                };
            }
            return acc;
        }, {});

        return Object.entries(this.members).reduce((merged_list, [email, local_right]) => {
            merged_list[email] = {
                status: (email in merged_list) ?
                    (merged_list[email].right === local_right ? 'ok' : 'changed') :
                    'new',
                email: email,
                right: local_right
            };
            return merged_list;
        }, merged_list);
    }

    /**
     * Display the list of each storage member.
     *
     * Ths list displayed is a diff between official storage permission (the `permissions` argument)
     * and the internal member list.
     *
     * @param permissions {Object[]}
     * @param user {User} self user
     * @param allow_edit {boolean} is the user allowed to change permissions ?
     */
    view({attrs: {permissions, user, allow_edit}}) {
        let diffed_members = this._diff(permissions);
        let has_several_admins = this._has_several_admins();

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
                                onchange: evt => this.members[member.email] = evt.target.value
                            }, [
                                m('option[value=read]', {selected: member.right === 'read'}, _('Read')),
                                m('option[value=write]', {selected: member.right === 'write'}, _('Write')),
                                m('option[value=admin]', {selected: member.right === 'admin'}, _('Admin'))
                            ])),
                            m('td', this._action_view(member, user, (!allow_edit) || (member.status !== 'deleted' && !has_several_admins && member.right === 'admin')))
                        ])),
                    m('tr', [
                        m('td', m('input.form-control.input-sm[type=email]', {
                            disabled: !allow_edit,
                            value: this.new_member.email,
                            onchange: evt => this.new_member.email = evt.target.value,
                            onkeypress: evt => {
                                // Activate new member form on ENTER press.
                                // It's required because html doesn't support nested forms.

                                evt.redraw = false; // redraw would erase the form value.

                                let keycode = evt.keyCode ? evt.keyCode : evt.which;
                                if (keycode === 13) {
                                    this.new_member.email = evt.target.value;
                                    this._submit_new_member(has_several_admins);
                                    evt.redraw = true;
                                    evt.preventDefault();
                                }
                            }
                        })),
                        m('td', m('select.form-control.input-sm', {
                            disabled: !allow_edit,
                            onchange: evt => this.new_member.right = evt.target.value,
                        }, [
                            m('option[value=read]', {selected: this.new_member.right === 'read'}, _('Read')),
                            m('option[value=write]', {selected: this.new_member.right === 'write'}, _('Write')),
                            m('option[value=admin]', {selected: this.new_member.right === 'admin'}, _('Admin'))
                        ])),
                        m('td', m('button[type=button].btn.btn-default', {
                            disabled: !allow_edit,
                            onclick: () => this._submit_new_member(has_several_admins)
                        }, m('span.glyphicon.glyphicon-plus')))
                    ])
                ])
            ]),
            m('.small', _('Note: it must always remains at least one admin member.'))
        ]);
    }

    _submit_new_member(has_several_admins) {
        if (!(/\S+@\S+\.\S+/.test(this.new_member.email)))
            return false;

        // always keep at least 1 admin
        if (!has_several_admins && this.new_member.right !== 'admin' &&
            this.new_member.email in this.members && this.members[this.new_member.email] === 'admin')
            return false;

        this.members[this.new_member.email] = this.new_member.right;
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
     * @return {boolean} true if there is more than one admin; false otherwise
     */
    _has_several_admins() {
        let nb_admin = 0;
        for (let p of Object.values(this.members)) {
            if (p === 'admin') {
                nb_admin++;
                if (nb_admin === 2)
                    return true;
            }
        }
        return false;
    }

    _action_view(member, user, disabled) {
        switch (member.status) {
            case 'ok':
            case 'changed':
            case 'new':
                return m('button[type=button].btn.btn-danger', {
                        disabled: disabled,
                        onclick: () => {
                            delete this.members[member.email];
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
                            this.members[member.email] = member.right;
                            return false;
                        }
                    },
                    m('span.glyphicon.glyphicon-plus')
                );
        }
    }
}
