
import {CanceledError, PassphraseRejectedError} from '../models/task_errors';
import {safe_exec_callback} from '../utils/callbacks';


export let TaskStatus = {
    GET_USER_KEY: 'GET_USER_KEY',
    WAIT_FOR_PASSPHRASE: 'WAIT_FOR_PASSPHRASE',
    GET_STORAGE_KEY: 'GET_STORAGE_KEY',
    LISTING_DIRECTORY: 'LISTING_DIRECTORY',
    SUBTASK_EXECUTION: 'SUBTASK_EXECUTION',
    PREPARE_FILE: 'PREPARE_FILE',
    ENCRYPT_FILE: 'ENCRYPT_FILE',
    DECRYPT_FILE: 'DECRYPT_FILE',
    DOWNLOAD_FILE: 'DOWNLOAD_FILE',
    UPLOAD_FILE: 'UPLOAD_FILE',
    ONGOING: 'ONGOING',
    FINALIZE: 'FINALIZE',
    DONE: 'DONE',
};


export let TaskType = {
    CREATION: 'CREATION',
    DELETION: 'DELETION',
    DOWNLOAD: 'DOWNLOAD',
    UPLOAD: 'UPLOAD',
    GENERIC: 'GENERIC'
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
    constructor(type = TaskType.GENERIC) {
        /** @type {?String} one of TaskStatus */
        this.status = null;

        /** {String} one of TaskType */
        this.type = type;

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
     * @param task_manager {TaskManager}
     * @return {Promise}
     */
    start(task_manager) {
        this.promise = this._wrap_start(task_manager);
        return this.promise;
    }

    // jshint ignore:start
    async _wrap_start(task_manager) {
        try {
            await this._start(task_manager);
        } catch (err) {
            this.set_progress(null);
            this.set_error(err);
        }
        this.set_status(TaskStatus.DONE);
        if (this.has_unexpected_errors() && this.errors.length) {
            console.error(`Task ${this.get_description()} failed`,
                this.errors.length > 1 ? this.errors : this.errors[0]);
            throw this.errors[0];
        }
    }
    // jshint ignore:end

    //// Protected methods

    set_status(status, progress) {
        this.status = status;
        if (progress !== undefined)
            this.progress = progress;
        safe_exec_callback(this.onchange, 'Task:onchange', this);
    }

    set_progress(progress) {
        this.progress = progress;
        safe_exec_callback(this.onchange, 'Task:onchange', this);
    }

    set_error(error) {
        this.errors.push(error);
        safe_exec_callback(this.onchange, 'Task:onchange', this);
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
