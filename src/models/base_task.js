

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

        /** @type {?number} between 0 and 1. */
        this.progress = null;
    }

    set_status(status) {
        this.status = status;
        if (this.onstatuschange)
            this.onstatuschange(this.status);
    }

    ended() {
        return [TaskStatus.ERROR, TaskStatus.DONE, TaskStatus.ABORTED].includes(this.status);
    }

    /**
     *
     * @param storage
     * @param user
     * @param passphrase_input
     * @return {Promise.<?openpgp.Key>}
     */
    async unlock_storage(storage, user, passphrase_input) {
        this.set_status(TaskStatus.GET_USER_KEY);
        let user_key = await user.get_key();
        if (!(user_key.primaryKey.isDecrypted)) {
            this.set_status(TaskStatus.WAIT_FOR_PASSPHRASE);
            try {
                await passphrase_input.decrypt_key(user_key);
            } catch (err) {
                if (err instanceof passphrase_input.constructor.UserCancelError) {
                    this.set_status(TaskStatus.ABORTED);
                    return null;
                }
                throw err;
            }
        }

        this.set_status(TaskStatus.GET_STORAGE_KEY);
        return await storage.get_key(user_key);
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
