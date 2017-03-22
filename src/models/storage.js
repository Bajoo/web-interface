
export default class Storage {

    constructor({id, name, description, is_encrypted, rights}) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.is_encrypted = is_encrypted;

        this._rights = rights;
    }
}
