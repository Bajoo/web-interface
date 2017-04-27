
import Upload from './upload';


export default class Folder {

    constructor(storage, {subdir}) {
        this.storage = storage;

        // full name (without trailing slash).
        this.fullname = subdir.replace(/\/+$/, '');
        this.name = this.fullname.split('/').pop() || '';

        /** @type {?Array<File|Folder>} */
        this.items = undefined;

        /** @type {undefined|?Error} */
        this.error = null;

        /**
         * @type {?Function} callback, called when an error occurs.
         * It receives the error as argument.
         */
        this.onerror = null;
    }

    /**
     * Refresh the item list.
     * @return {Promise}
     */
    load_items() {
        return this.storage.list_files(this.fullname).then(items => {
            this.error = null;
            this.items = items;
            return items;
        }, err => {
            this.error = err;
            this.items = null;
            console.error(`Fetching item list of folder "${this.fullname}" failed`, err);
            if(this.onerror)
                this.onerror(err);
            throw err;
        });
    }

    upload(file) {
        return new Upload(this, file);
    }
}
