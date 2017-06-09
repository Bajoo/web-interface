
import {CanceledError, PassphraseRejectedError} from '../models/task_errors';


export let TaskStatus = {
    GET_USER_KEY: 'GET_USER_KEY',
    WAIT_FOR_PASSPHRASE: 'WAIT_FOR_PASSPHRASE',
    GET_STORAGE_KEY: 'GET_STORAGE_KEY',
    PREPARE_FILE: 'PREPARE_FILE',
    ENCRYPT_FILE: 'ENCRYPT_FILE',
    DECRYPT_FILE: 'DECRYPT_FILE',
    DOWNLOAD_FILE: 'DOWNLOAD_FILE',
    UPLOAD_FILE: 'UPLOAD_FILE',
    ONGOING: 'ONGOING',
    FINALIZE: 'FINALIZE',
    DONE: 'DONE',
};


/**
 * Abstract class for long-running task.
 *
 * A task has status defined at start, and updated according to the progression. When the task ends, the status DONE is
 * assigned to it.
 * A task can produces errors. Errors are independent of the status: a task can throw error but continue to run. Also,
 * the status of a failed task is still DONE.
 *
 * Child classes must implements theses two methods:
 * - `_start()` is the entry point to execute the task.
 * - `get_description()` gives an human-readable overview of the task.
 *
 */
export default class BaseTask {
    constructor() {
        /** @type {?String} one of TaskStatus */
        this.status = null;

        /**
         * Callback called when the task state changes. It can be a state change, a progress change or a new error.
         *
         * It receive the task in parameter.
         *
         * @type {?Function}
         */
        this.onchange = null;

        /**
         * List of errors occurred during the task execution. Each new errors will be pushed in this array.
         * If no error occurred, the value in an empty array.
         *
         * @type {Error[]}
         */
        this.errors = [];

        /** @type {?number} between 0 and 1. */
        this.progress = null;

        /** @type {?Promise} promise set when the task begins. */
        this.promise = null;
    }

    /**
     * Return the scope impacted by this task.
     * @return {null}
     */
    get_scope() {
        return null;
    }

    /**
     * Detect if there is non-cleared unexpected error.
     *
     * All errors are unexpected errors, expect user cancellation.
     * @return {boolean}
     */
    has_unexpected_errors() {
        return this.errors.some(err => !(err instanceof CanceledError));
    }

    is_canceled() {
        return this.errors.some(err => err instanceof CanceledError);
    }

    is_done() {
        return this.status === TaskStatus.DONE;
    }

    /**
     * Start the task.
     *
     * @param passphrase_input {PassphraseInput}
     * @return {Promise}
     */
    start(passphrase_input) {
        this.promise = this._wrap_start(passphrase_input);
        return this.promise;
    }

    // jshint ignore:start
    async _wrap_start(passphrase_input) {
        try {
            await this._start(passphrase_input);
        } catch (err) {
            this.set_progress(null);
            this.set_error(err);
        }
        this.set_status(TaskStatus.DONE);
        if (this.has_unexpected_errors()) {
            console.error(`Task ${this.get_description()} failed`, this.errors);
            throw this.errors[0];
        }
    }
    // jshint ignore:end

    /**
     * Safe way to trigger onchange callback.
     * @private
     */
    _call_onchange() {
        if (this.onchange) {
            try {
                this.onchange(this);
            } catch (err) {
                console.error('Task: onchange callback threw an unexpected Error', err);
            }
        }
    }

    //// Protected methods

    set_status(status, progress) {
        this.status = status;
        if (progress !== undefined)
            this.progress = progress;
        this._call_onchange();
    }

    set_progress(progress) {
        this.progress = progress;
        this._call_onchange();
    }

    set_error(error) {
        this.errors.push(error);
        this._call_onchange();
    }

    /**
     * If the storage is encrypted and locked, unlock it. Ask the user its passphrase if needed.
     *
     * @param storage
     * @param user
     * @param passphrase_input
     * @return {Promise.<openpgp.Key>} the storage passphrase
     */
    // jshint ignore:start
    async unlock_storage(storage, user, passphrase_input) {
        this.set_status(TaskStatus.GET_USER_KEY);
        let user_key = await user.get_key();
        if (!(user_key.primaryKey.isDecrypted)) {
            this.set_status(TaskStatus.WAIT_FOR_PASSPHRASE);
            try {
                await passphrase_input.decrypt_key(user_key);
            } catch (err) {
                if (err instanceof passphrase_input.constructor.UserCancelError) {
                    throw new PassphraseRejectedError(this);
                }
                throw err;
            }
        }

        this.set_status(TaskStatus.GET_STORAGE_KEY);
        return await storage.get_key(user_key);
    }
    // jshint ignore:end
}
