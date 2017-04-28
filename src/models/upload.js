
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

    // app.user
    async start(passphrase_input) {
        try {
            return await this._start(passphrase_input);
        } catch (err) {
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
            storage_key = await this.dest_folder.storage.get_key(user_key);
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
            serialize: x => x
        });
        this.set_status(TaskStatus.DONE);
    }

}
