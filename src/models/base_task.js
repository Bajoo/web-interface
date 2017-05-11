

/**
 * Abstract class for long-running task.
 */
export default class BaseTask {
    constructor() {
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

    ended() {
        return [TaskStatus.ERROR, TaskStatus.DONE, TaskStatus.ABORTED].includes(this.status);
    }
}


export let TaskStatus = {
    GET_USER_KEY: 'GET_USER_KEY',
    WAIT_FOR_PASSPHRASE: 'WAIT_FOR_PASSPHRASE',
    GET_STORAGE_KEY: 'GET_STORAGE_KEY',
    PREPARE_FILE: 'PREPARE_FILE',
    ENCRYPT_FILE: 'ENCRYPT_FILE',
    DECRYPT_FILE: 'DECRYPT_FILE',
    DOWNLOAD_FILE: 'DOWNLOAD_FILE',
    UPLOAD_FILE: 'UPLOAD_FILE',
    FINALIZE: 'FINALIZE',
    DONE: 'DONE',
    ERROR: 'ERROR',
    ABORTED: 'ABORTED'
};
