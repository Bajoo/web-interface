
import app from '../app';
import {TaskStatus, default as BaseTask} from './base_task';
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

export default class Upload extends BaseTask {

    constructor(folder, file) {
        super();
        this.dest_folder = folder;
        this.file = file;
    }

    /**
     * Return a few words describing the task.
     * @param [ltpl=String.raw] literal template (used for i18n)
     * @returns {string}
     */
    get_description(ltpl=String.raw) {
        return ltpl`Upload of "${this.file.name}"`;
    }

    get_scope() {
        return `/storages/${this.dest_folder.storage.id}/browse/${this.dest_folder.fullname}`;
    }

    // app.user
    // jshint ignore:start
    async _start(task_manager) {
        let file = this.file;
        let storage_key = null;

        if (this.dest_folder.storage.is_encrypted) {
            storage_key = await this.unlock_storage(this.dest_folder.storage, app.user, task_manager.passphrase_input);
        }

        this.set_status(TaskStatus.PREPARE_FILE);

        let file_content = await blob2array_buffer(file);

        if (this.dest_folder.storage.is_encrypted) {
            this.set_status(TaskStatus.ENCRYPT_FILE);
            file_content = await encrypt(new Uint8Array(file_content), storage_key);
        }

        this.set_status(TaskStatus.UPLOAD_FILE);
        await this.dest_folder.storage.session.storage_request({
            url: `/storages/${this.dest_folder.storage.id}/${this.dest_folder.fullname ? `${this.dest_folder.fullname}/` : ''}${file.name}`,
            method: 'PUT',
            data: file_content,
            serialize: x => x,
            config: xhr => {
                xhr.upload.addEventListener('progress', evt => {
                    if (evt.lengthComputable) {
                        this.set_progress(evt.loaded / evt.total);
                    }
                });
            }
        });
        this.set_status(TaskStatus.DONE, 1);
    }
    // jshint ignore:end
}
