
import m from 'mithril';
import {TaskStatus} from './base_task';
import Download from './download';


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

    /**
     * @param passphrase_input {PassphraseInput}
     * @param status {Status}
     */
    constructor(passphrase_input, status) {
        this.passphrase_input = passphrase_input;
        this.app_status = status;
    }

    start(task) {
        task.onstatuschange = st => this._status_task_change(task, st);
        task.start(this.passphrase_input);
    }

    _status_task_change(task, task_status) {
        let task_name = task.constructor.name;
        switch (task_status) {
            case null:
            case TaskStatus.ABORTED:
                this.app_status.clear();
                break;
            case TaskStatus.DONE:
                this.app_status.set('success', `${task_name}: ${status2msg[task_status]}`);
                break;
            case TaskStatus.ERROR:
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
