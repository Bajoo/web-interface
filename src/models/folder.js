
import app from '../app';
import {encrypt} from '../encryption';


function blob2array_buffer(blob) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onerror = () => reject(reader.error);
        reader.onabort = () => reject(reader.error);
        reader.onloadend = () => resolve(reader.result);
        reader.readAsArrayBuffer(blob);
    });
}

export default class Folder {

    constructor(storage, {subdir}) {
        this.storage = storage;

        // full name (without trailing slash).
        this.fullname = subdir.replace(/\/+$/, '');
        this.name = this.fullname.split('/').pop() || '';

        /** @type {?Array<File|Folder>} */
        this.items = undefined;

        /** @type {?Error} */
        this.error = null;

        /**
         * @type {?Function} callback, called when an error occurs.
         * 1rst argument is the folder instance
         * 2nd argument is the error.
         */
        this.onerror = null;
    }

    /**
     * Refresh the item list.
     * @return {Promise}
     */
    refresh() {
        return this.storage.list_files(this.fullname).then(items => {
            this.error = null;
            this.items = items;
            return items;
        }, err => {
            this.error = err;
            this.items = null;
            console.error(`Fetching item list of folder "${this.fullname}" failed`, err);
            this.onerror && this.onerror(this, err);
            throw err;
        });
    }

    upload(passphrase_input, file) {
        console.log('upload ...');

        let p = null;

        if (this.storage.is_encrypted) {
            p = app.user.get_key()
                .then(user_key => user_key.primaryKey.isDecrypted ?
                    user_key :
                    passphrase_input.decrypt_key(user_key))
                .then(user_key => this.storage.get_key(user_key))
                .then(storage_key => blob2array_buffer(file)
                    .then(raw_file => encrypt(new Uint8Array(raw_file), storage_key))
                );
        } else {
            p = blob2array_buffer(file);
        }

        p.then(encrypted_file => {
            return this.storage.session.storage_request({
                url: `/storages/${this.storage.id}/${this.fullname ? `${this.fullname}/${file.name}` : file.name}`,
                method: 'PUT',
                data: encrypted_file,
                serialize: x => x
            });
        })
            .then(() => console.log('UPLOAD encrypted file ok'), err => {
                if (err instanceof passphrase_input.constructor.UserCancelError)
                    return;
                console.log('Upload attempt failed:', err, err.stack);
            })
            .then(() => this.refresh());
    }
}
