
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

export default class Upload {
    constructor(folder, file) {
        this.dest_folder = folder;
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
            this.set_status(UploadStatus.ERROR);
            console.error(`Upload failed`, err);
            throw err;
        }
    }

    // app.user
    async _start(passphrase_input) {
        let file = this.file;
        let storage_key = null;

        if (this.dest_folder.storage.is_encrypted) {
            this.set_status(UploadStatus.GET_USER_KEY);
            let user_key = await app.user.get_key();
            if (!(user_key.primaryKey.isDecrypted)) {
                this.set_status(UploadStatus.WAIT_FOR_PASSPHRASE);
                try {
                    await passphrase_input.decrypt_key(user_key);
                } catch (err) {
                    if (err instanceof passphrase_input.constructor.UserCancelError) {
                        this.set_status(UploadStatus.ABORTED);
                        return;
                    }
                    throw err;
                }
            }

            this.set_status(UploadStatus.GET_STORAGE_KEY);
            storage_key = await this.dest_folder.storage.get_key(user_key);
        }

        this.set_status(UploadStatus.PREPARE_FILE);

        let file_content = await blob2array_buffer(file);

        if (this.dest_folder.storage.is_encrypted) {
            this.set_status(UploadStatus.ENCRYPT_FILE);
            file_content = await encrypt(new Uint8Array(file_content), storage_key);
        }
        this.set_status(UploadStatus.ENCRYPT_FILE);

        this.set_status(UploadStatus.UPLOAD_FILE);
        await this.dest_folder.storage.session.storage_request({
            url: `/storages/${this.dest_folder.storage.id}/${this.dest_folder.fullname ? `${this.dest_folder.fullname}/` : ''}${file.name}`,
            method: 'PUT',
            data: file_content,
            serialize: x => x
        });
        this.set_status(UploadStatus.DONE);
    }

}

export let UploadStatus = {
    GET_USER_KEY: 'GET_USER_KEY',
    WAIT_FOR_PASSPHRASE: 'WAIT_FOR_PASSPHRASE',
    ABORTED: 'ABORTED',
    GET_STORAGE_KEY: 'GET_STORAGE_KEY',
    PREPARE_FILE: 'PREPARE_FILE',
    ENCRYPT_FILE: 'ENCRYPT_FILE',
    UPLOAD_FILE: 'UPLOAD_FILE',
    DONE: 'DONE',
    ERROR: 'ERROR'
};
