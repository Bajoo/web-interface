

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
         * Map of members. Each key is an email, and each value is one of "read", "write" or "admin".
         *
         * Local changes are done on this map, before submission.
         */
        this.members = permissions.reduce((acc, p) => {
            if (p.scope === 'user')
                acc[p.user] = p.admin ? 'admin' : p.write ? 'write' : 'read';
            return acc;
        }, {});
    }

    get(email) {
        return email in this.members ? this.members[email] : null;
    }

    set(email, permission) {
        this.members[email] = permission;
    }

    del(email) {
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
                right: local_right
            };
            return merged_list;
        }, merged_list);
    }
}
