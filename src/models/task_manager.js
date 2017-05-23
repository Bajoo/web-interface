
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

        /**
         * list of registered tasks.
         * @type {BaseTask[]}
         */
        this.tasks = [];

        /** @type {prop} if true, display the task list modal */
        this.show_task_list = prop(false);

        initialize_encryption();

        window.onbeforeunload = (evt) => this._onbeforeunload(evt);
    }

    _onbeforeunload(evt) {
        // Recent browsers doesn't display the message, and some of them completely ignores the result.
        if (this.tasks.filter(t => !t.is_done()).length) {
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
        task.onchange = task => m.redraw();
        return task.start(this.passphrase_input);
    }

    clean_task(task) {
        let idx = this.tasks.indexOf(task);
        if (idx !== -1)
            this.tasks.splice(idx, 1);
    }
}
