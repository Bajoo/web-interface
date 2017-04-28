
import m from 'mithril';
import openpgp from 'openpgp';
import {TaskStatus} from './base_task';
import Download from './download';
import Status from '../view_models/status';
import PassphraseInput from '../view_models/passphrase_input';


const status2msg = {
    [TaskStatus.GET_USER_KEY]: 'Fetch user key ...',
    [TaskStatus.WAIT_FOR_PASSPHRASE]: 'Wait for passphrase ...',
    [TaskStatus.PREPARE_FILE]: 'Read file content ...',
    [TaskStatus.ENCRYPT_FILE]: 'Encrypt file ...',
    [TaskStatus.DECRYPT_FILE]: 'Decrypt file ...',
    [TaskStatus.GET_STORAGE_KEY]: 'Fetch storage key ...',
    [TaskStatus.DOWNLOAD_FILE]: 'Download file from server ...',
    [TaskStatus.UPLOAD_FILE]: 'Upload file to server...',
    [TaskStatus.FINALIZE]: 'Finalize file ...',
    [TaskStatus.DONE]: 'Done!'
};


/**
 * Handle and execute long-running task such as upload and download.
 */
export default class TaskManager {

    constructor() {
        /** @type {PassphraseInput} */
        this.passphrase_input = new PassphraseInput();

        /** @type {Status} */
        this.app_status = new Status();

        /**
         * list of registered tasks.
         * @type {BaseTask[]}
         */
        this.tasks = [];

        // TODO: fix path for production env
        openpgp.initWorker({ path:'./node_modules/openpgp/dist/openpgp.worker.js' });

        window.onbeforeunload = () => this._onbeforeunload();
    }

    _onbeforeunload(evt) {
        // TODO: improves this.
        // Recent browsers doesn't display the message, and some of them completely ignores the result.
        if (this.tasks.length) {
            let msg = 'Some of your operations (upload or download) are not done yet.\n' +
                    'Leaving this page will interrupt them. Are you sure to leave ?';
            evt.returnValue = msg;
            return msg;
        }
    }

    start(task) {
        this.tasks.push(task);
        task.onstatuschange = st => this._status_task_change(task, st);
        task.start(this.passphrase_input);
    }

    clean_task(task) {
        let idx = this.tasks.indexOf(task);
        if (idx !== -1)
            this.tasks.splice(idx, 1);
    }

    // TODO: get a status distinct for each task.
    _status_task_change(task, task_status) {
        let task_name = task.constructor.name;
        switch (task_status) {
            case null:
            case TaskStatus.ABORTED:
                this.clean_task(task);
                this.app_status.clear();
                break;
            case TaskStatus.DONE:
                this.clean_task(task);
                if (this.tasks.length === 0)
                    this.app_status.set('success', `${task_name}: ${status2msg[task_status]}`);
                break;
            case TaskStatus.ERROR:
                this.clean_task(task);
                let err = task.error;
                if (task instanceof Download && err.xhr && err.xhr.status === 404) {
                    // TODO: 404 could be caused by user key or storage key.
                    this.app_status.set_error('Download: file not found');
                } else {
                    this.app_status.set_error(`${task_name} failed: ${err.message || err}`);
                }
                break;
            default:
                this.app_status.set('info', `${task_name}: ${status2msg[task_status]}`);
        }
        m.redraw();
    }
}
