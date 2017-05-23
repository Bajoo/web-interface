
import {_, _l} from '../utils/i18n';


/**
 * List of error related to the different tasks.
 *
 * Each error has a human-readable message, that can be displayed to the user.
 * Also, each Error contains a `task` attribute for debug.
 */


export class TaskError extends Error {
    constructor(task, message) {
        super(message);
        this.name = 'TaskError';
        this.task = task;
    }

    toString() {
        return _(this.message);
    }
}

/**
 * Error thrown when the user cancel a task.
 */
export class CanceledError extends TaskError {
    constructor(task, message='Operation canceled') {
        super(task, message);
        this.name = 'CanceledError';
    }
}


export class PassphraseRejectedError extends CanceledError {
    constructor(task) {
        super(task, 'The passphrase request was rejected');
        this.name = 'PassphraseRejectedError';
    }
}


/**
 * Download: the file doesn't exists.
 *
 * Note: it's not thrown on PGP key download.
 */
export class NotFoundError extends TaskError {
    constructor(task) {
        super(task, 'File not found (404)');
        this.name = 'NotFoundError';
    }
}


export class NoUserKeyError extends TaskError {
    constructor(task, user, reason = null) {
        super(task, "User doesn't exists or has no PGP key");
        this.name = 'NoUserKeyError';
        this.user = user;
        this.reason = reason;
    }

    toString() {
        return _l`User "${this.user}" doesn't exist or has no PGP key`;
    }
}


export class PermissionUpdateFailed extends TaskError {
    constructor(task, storage, user, reason = null) {
        super(task, 'Update of storage permission failed');
        this.name = 'PermissionUpdateFailed';
        this.storage = storage;
        this.user = user;
        this.reason = reason;
    }

    toString() {
        return _l`Update of "${this.user}" permissions for storage "${this.storage.name}" failed`;
    }
}

export class StorageKeyError extends TaskError {
    constructor(task, storage, reason = null) {
        super(task, 'Update of storage key failed');
        this.name = 'StorageKeyError';
        this.storage = storage;
        this.reason = reason;
    }
}
