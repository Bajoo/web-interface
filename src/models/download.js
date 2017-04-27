
import app from '../app';
import {decrypt} from '../encryption';


/**
 * Download task
 *
 * When its status is updated, the corresponding callback is called (if set).
 */
export default class Download {

    constructor(file) {
        this.file = file;

        /** @type {?String} */
        this.status = null;

        /** @type {Function} */
        this.onstatuschange = null;

        /** @type {?Error} */
        this.error = null;
    }

    set_status(status) {
        this.status = status;
        if (this.onstatuschange)
            this.onstatuschange(this.status);
    }

    // app.user
    async start(passphrase_input) {
        try {
            return await this._start(passphrase_input);
        } catch (err) {
            this.error = err;
            this.set_status(DownloadStatus.ERROR);
            console.error(`Download of "${this.file.fullname}" failed`, err);
            throw err;
        }
    }

    async _start(passphrase_input) {
        let storage_key = null;

        if (this.file.storage.is_encrypted) {
            this.set_status(DownloadStatus.GET_USER_KEY);
            let user_key = await app.user.get_key();
            if (!(user_key.primaryKey.isDecrypted)) {
                this.set_status(DownloadStatus.WAIT_FOR_PASSPHRASE);
                try {
                    await passphrase_input.decrypt_key(user_key);
                } catch (err) {
                    if (err instanceof passphrase_input.constructor.UserCancelError) {
                        this.set_status(DownloadStatus.ABORTED);
                        return;
                    }
                    throw err;
                }
            }

            this.set_status(DownloadStatus.GET_STORAGE_KEY);
            storage_key = await this.file.storage.get_key(user_key);
        }

        this.set_status(DownloadStatus.DL_FILE);
        let raw_file = await this.file.storage.get_file(this.file.fullname);
        if (this.file.storage.is_encrypted) {
            this.set_status(DownloadStatus.DECRYPT_FILE);
            raw_file = await decrypt(raw_file, storage_key);
        }

        this.set_status(DownloadStatus.FINALIZE);
        this._export(this.file.name, new Blob([raw_file]));
        this.set_status(DownloadStatus.DONE);
    }


    /**
     * Export a file: display the browser "Save" window.
     *
     * @param name {String} default name of the file.
     * @param content {Blob} file content.
     */
    _export(name, content) {
        let a = document.createElement("a");
        a.href = URL.createObjectURL(content);
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    }
}

export let DownloadStatus = {
    GET_USER_KEY: 'GET_USER_KEY',
    WAIT_FOR_PASSPHRASE: 'WAIT_FOR_PASSPHRASE',
    ABORTED: 'ABORTED',
    GET_STORAGE_KEY: 'GET_STORAGE_KEY',
    DL_FILE: 'DL_FILE',
    DECRYPT_FILE: 'DECRYPT_FILE',
    FINALIZE: 'FINALIZE',
    DONE: 'DONE',
    ERROR: 'ERROR'
};
