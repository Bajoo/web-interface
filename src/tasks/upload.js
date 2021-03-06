
import app from '../app';
import {TaskStatus, TaskType, default as BaseTask} from './base_task';
import {CanceledError, FileReaderError} from '../models/task_errors';
import {encrypt} from '../encryption';


function blob2array_buffer(task, blob) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onerror = () => reject(new FileReaderError(task, blob, reader.error));
        reader.onabort = () => reject(new CanceledError(task));
        reader.onloadend = () => resolve(reader.result);
        reader.readAsArrayBuffer(blob);
    });
}

export default class Upload extends BaseTask {

    constructor(folder, file) {
        super(TaskType.UPLOAD);
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
        let base = `/storage/${this.dest_folder.storage.id}/browse`;
        if (this.dest_folder.fullname)
            return `${base}/${this.dest_folder.fullname}/${this.file.name}`;
        else
            return `${base}/${this.file.name}`;
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

        let file_content = await blob2array_buffer(self, file);

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
