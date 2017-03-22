
export default class Storage {

    constructor({id, name, description, is_encrypted, rights}) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.is_encrypted = is_encrypted;

        this._rights = rights;
    }

    static get(session, storage_id) {
        return session.request({
            url: `/storages/${storage_id}`,
            background: true,
            type: Storage
        });
    }
}
