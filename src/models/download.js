
import app from '../app';
import {TaskStatus, default as BaseTask} from './base_task';
import {NotFoundError} from './task_errors';
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
     * Return a few words describing the task.
     * @param [ltpl=String.raw] literal template (used for i18n)
     * @returns {string}
     */
    get_description(ltpl = String.raw) {
        return ltpl`Download of "${this.file.name}"`;
    }

    // jshint ignore:start
    async _start(passphrase_input) {
        let storage_key = null;

        if (this.file.storage.is_encrypted) {
            storage_key = await this.unlock_storage(this.file.storage, app.user, passphrase_input);
        }

        this.set_status(TaskStatus.DOWNLOAD_FILE);
        let raw_file;
        try {
            raw_file = await this.file.storage.get_file(this.file.fullname, evt => {
                if (evt.lengthComputable) {
                    this.set_progress(evt.loaded / evt.total);
                }
            });
        } catch (err) {
            if (err.xhr && err.xhr.status === 404)
                throw new NotFoundError(this);
            throw err;
        }

        this.set_progress(1);
        if (this.file.storage.is_encrypted) {
            this.set_status(TaskStatus.DECRYPT_FILE);
            raw_file = await decrypt(raw_file, storage_key);
        }

        this.set_status(TaskStatus.FINALIZE);
        this._export(this.file.name, new Blob([raw_file]));
        this.set_status(TaskStatus.DONE);
    }
    // jshint ignore:end


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
