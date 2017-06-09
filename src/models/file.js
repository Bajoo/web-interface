
import Download from '../tasks/download';


export default class File {

    constructor(storage, {name, hash, last_modified, bytes}) {
        this.storage = storage;

        this.fullname = name;
        this.name = name.split('/').pop();
        this.hash = hash;
        this.bytes = bytes;

        // TODO: fix hack in swift server
        this.last_modified = new Date(last_modified + 'Z');
    }

    download() {
        return new Download(this);
    }

    del() {
        return this.storage.session.storage_request({
            method: 'DELETE',
            url: `/storages/${this.storage.id}/${this.fullname}`
        });
    }
}
