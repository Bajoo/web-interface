
import m from 'mithril';
import {initialize as initialize_encryption} from '../encryption';
import {TaskStatus} from './base_task';
import Download from './download';
import {_, _l} from '../utils/i18n';
import prop from '../utils/prop';
import Status from '../view_models/status';
import PassphraseInput from '../view_models/passphrase_input';



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

        /** @type {prop} if trus, display the task list modal */
        this.show_task_list = prop(false);

        initialize_encryption();

        window.onbeforeunload = (evt) => this._onbeforeunload(evt);
    }

    _onbeforeunload(evt) {
        // Recent browsers doesn't display the message, and some of them completely ignores the result.
        if (this.tasks.filter(t => !t.ended()).length) {
            this.show_task_list(true);
            m.redraw();
            let msg = _('Some of your operations (upload or download) are not done yet.\n' +
                'Leaving this page will interrupt them. Are you sure to leave ?');
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

    _status_task_change(task, task_status) {
        switch (task_status) {
            case null:
            case TaskStatus.ABORTED:
            case TaskStatus.DONE:
                if (this.tasks.length === 0)
                    this.app_status.clear();
                break;
            case TaskStatus.ERROR:
                let err = task.error;
                if (task instanceof Download && err.xhr && err.xhr.status === 404) {
                    // TODO: 404 could be caused by user key or storage key.
                    this.app_status.set_error(_('Download: file not found'));
                } else {
                    this.app_status.set_error(_l`${_(task.get_name())} failed: ${err.message || err}`);
                }
                break;
        }
        m.redraw();
    }
}
