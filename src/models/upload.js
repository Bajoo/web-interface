
import m from 'mithril';
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
     * @returns {string} name of the task. compatible 3state i18n.
     */
    get_name() {
        return 'Upload';
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
            this.progress = null;
            this.error = err;
            this.set_status(TaskStatus.ERROR);
            console.error(`Upload failed`, err);
            throw err;
        }
    }

    // app.user
    async _start(passphrase_input) {
        let file = this.file;
        let storage_key = null;

        if (this.dest_folder.storage.is_encrypted) {
            storage_key = await this.unlock_storage(this.dest_folder.storage, app.user, passphrase_input);
        }

        this.set_status(TaskStatus.PREPARE_FILE);

        let file_content = await blob2array_buffer(file);

        if (this.dest_folder.storage.is_encrypted) {
            this.set_status(TaskStatus.ENCRYPT_FILE);
            file_content = await encrypt(new Uint8Array(file_content), storage_key);
        }
        this.set_status(TaskStatus.ENCRYPT_FILE);

        this.set_status(TaskStatus.UPLOAD_FILE);
        await this.dest_folder.storage.session.storage_request({
            url: `/storages/${this.dest_folder.storage.id}/${this.dest_folder.fullname ? `${this.dest_folder.fullname}/` : ''}${file.name}`,
            method: 'PUT',
            data: file_content,
            serialize: x => x,
            config: xhr => {
                xhr.upload.addEventListener('progress', evt => {
                    if (evt.lengthComputable) {
                        this.progress = evt.loaded / evt.total;
                        m.redraw();
                    }
                });
            }
        });
        this.progress = 1;
        m.redraw();
        this.set_status(TaskStatus.DONE);

        //Reload folder list. Its result (or error) is not handled here.
        //Note that it should not be necessary to reload it if the folder is not displayed.
        this.dest_folder.load_items().then(m.redraw);
    }

}
