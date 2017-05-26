
import m from 'mithril';
import {initialize as initialize_encryption} from '../encryption';
import {_} from '../utils/i18n';
import prop from '../utils/prop';
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

        /**
         * List of tasks, referenced by the scope impacted (a string ID representing a page).
         *
         * @type {{}}
         */
        this.tasks_by_scope = {};

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
        this._register_task_to_scope(task);
        task.onchange = task => m.redraw();
        return task.start(this.passphrase_input)
            .then(
                result => { this._resolve_task_by_scope(task); return result; },
                err => { this._resolve_task_by_scope(task); throw err; });
    }

    clean_task(task) {
        let idx = this.tasks.indexOf(task);
        if (idx !== -1) {
            this.tasks.splice(idx, 1);
        }
    }

    register_scope_callback(scope, owner, callback) {
        if (!(scope in this.tasks_by_scope)) {
            this.tasks_by_scope[scope] = {
                tasks: [],
                callbacks: []
            };
        }
        this.tasks_by_scope[scope].callbacks.push({
            owner,
            callback
        });
    }

    unregister_scope_callback(scope, owner) {
        let scope_rel = this.tasks_by_scope[scope];

        if (scope_rel.tasks.length === 1 && scope_rel.callbacks.length === 0)
            delete this.tasks_by_scope[scope];
        else {
            let idx = scope_rel.callbacks.findIndex(ctx => ctx.owner === owner);
            scope_rel.callbacks.splice(idx, 1);
        }
    }

    /**
     * @param scope {String}
     * @return {BaseTask[]}
     */
    get_tasks_by_scope(scope) {
        return scope in this.tasks_by_scope ? this.tasks_by_scope[scope].tasks : [];
    }

    _register_task_to_scope(task) {
        let scope = task.get_scope();
        if (scope) {
            if (!(scope in this.tasks_by_scope)) {
                this.tasks_by_scope[scope] = {
                    tasks: [],
                    callbacks: []
                };
            }
            this.tasks_by_scope[scope].tasks.push(task);
        }
    }

    _resolve_task_by_scope(task) {
        let scope = task.get_scope();
        if (!scope)
            return;

        let scope_rel = this.tasks_by_scope[scope];

        let idx = scope_rel.tasks.indexOf(task);
        scope_rel.tasks.splice(idx, 1);
        if (scope_rel.tasks.length === 0 && scope_rel.callbacks.length === 0)
            delete this.tasks_by_scope[scope];
        for (let callback_ctx of scope_rel.callbacks) {
            try {
                callback_ctx.callback(scope_rel.tasks);
            } catch(err) {
                console.error(`TaskManager: callback failed for scope ${scope}`, err);
            }
        }
    }
}
