

export default class DiffMemberList {

    /**
     * component constructor
     *
     * `permissions` is a list of object containing:
     * - scope: the permission scope. Other than "user" are ignored.
     * - user: the user's email
     * - admin: admin permission
     * - write: write permission
     * - read: read permission
     *
     * @param permissions {Object[]}
     */
    constructor(permissions) {

        this.permissions = permissions;

        /**
         * If set, this user's permissions cannot be modified.
         * @type {?String} unmodifiable user email.
         */
        this.unmodifiable = null;

        /**
         * Map of members. Each key is an email, and each value is one of "read", "write" or "admin".
         *
         * Local changes are done on this map, before submission.
         */
        this.members = permissions.reduce((acc, p) => {
            if (p.scope === 'user') {
                acc[p.user] = p.admin ? 'admin' : p.write ? 'write' : 'read';
            }
            return acc;
        }, {});
    }

    /**
     * Make a new member list with only the creator as a member.
     * The permissions are the same as these attributed at storage creation.
     *
     * The creator permissions are marked unmodifiable.
     *
     * @param user_email {String}
     * @return DiffMemberList
     */
    static make_new(user_email) {
        let member_list = new DiffMemberList([{
            scope: 'user',
            user: user_email,
            read: true,
            write: true,
            admin: true,
            readonly: true
        }]);
        member_list.unmodifiable = user_email;
        return member_list;
    }



    get(email) {
        return email in this.members ? this.members[email] : null;
    }

    set(email, permission) {
        if (email !== this.unmodifiable)
            this.members[email] = permission;
    }

    del(email) {
        if (email !== this.unmodifiable)
            delete this.members[email];
    }

    /**
     * Make a "diff" between the internal member list and the official permissions.
     *
     * Return a map of all users present at least in one of the both lists.
     * Each key is an email, and the value is an object containing:
     * - email: the member email
     * - right: the member permission
     * - status: one of "added", "ok", "changed" or "deleted"
     * - readonly: if true, permission cannot be modified.
     *
     * @return {Object}
     */
    diff() {
        let merged_list = this.permissions.reduce((acc, current) => {
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
                right: local_right,
                readonly: email === this.unmodifiable
            };
            return merged_list;
        }, merged_list);
    }
}
