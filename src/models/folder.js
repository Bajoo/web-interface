
import Upload from '../tasks/upload';


export default class Folder {

    constructor(storage, {subdir}) {
        this.storage = storage;

        // full name (without trailing slash).
        this.fullname = subdir.replace(/\/+$/, '');
        this.name = this.fullname.split('/').pop() || '';

        /** @type {?Array<File|Folder>} */
        this.items = null;
    }

    /**
     * Refresh the item list.
     * @return {Promise}
     */
    load_items(recursive=false) {
        return this.storage.list_files(this.fullname, recursive).then(items => {
            this.items = items;
            return items;
        }, err => {
            this.items = null;
            console.error(`Fetching item list of folder "${this.fullname}" failed`, err);
            throw err;
        });
    }

    upload(file) {
        return new Upload(this, file);
    }
}
