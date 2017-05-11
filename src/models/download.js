
import app from '../app';
import {TaskStatus, default as BaseTask} from './base_task';
import {decrypt} from '../encryption';


/**
 * Download task
 *
 * When its status is updated, the corresponding callback is called (if set).
 */
export default class Download extends BaseTask {

    constructor(file) {
        super();
        this.file = file;
    }

    /**
     * @returns {string} name of the task. compatible 3state i18n.
     */
    get_name() {
        return 'Download';
    }

    /**
     * @return {String} name of the target.
     */
    get_target() {
        return this.file.name;
    }

    // app.user
    async start(passphrase_input) {
        try {
            return await this._start(passphrase_input);
        } catch (err) {
            this.error = err;
            this.set_status(TaskStatus.ERROR);
            console.error(`Download of "${this.file.fullname}" failed`, err);
            throw err;
        }
    }

    async _start(passphrase_input) {
        let storage_key = null;

        if (this.file.storage.is_encrypted) {
            this.set_status(TaskStatus.GET_USER_KEY);
            let user_key = await app.user.get_key();
            if (!(user_key.primaryKey.isDecrypted)) {
                this.set_status(TaskStatus.WAIT_FOR_PASSPHRASE);
                try {
                    await passphrase_input.decrypt_key(user_key);
                } catch (err) {
                    if (err instanceof passphrase_input.constructor.UserCancelError) {
                        this.set_status(TaskStatus.ABORTED);
                        return;
                    }
                    throw err;
                }
            }

            this.set_status(TaskStatus.GET_STORAGE_KEY);
            storage_key = await this.file.storage.get_key(user_key);
        }

        this.set_status(TaskStatus.DOWNLOAD_FILE);
        let raw_file = await this.file.storage.get_file(this.file.fullname);
        if (this.file.storage.is_encrypted) {
            this.set_status(TaskStatus.DECRYPT_FILE);
            raw_file = await decrypt(raw_file, storage_key);
        }

        this.set_status(TaskStatus.FINALIZE);
        this._export(this.file.name, new Blob([raw_file]));
        this.set_status(TaskStatus.DONE);
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
