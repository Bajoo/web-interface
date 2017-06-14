
import m from 'mithril';
import {initialize as initialize_encryption} from '../encryption';
import {_} from '../utils/i18n';
import prop from '../utils/prop';
import {escape as regexp_escape} from '../utils/regexp';
import PassphraseInput from '../view_models/passphrase_input';



/**
 * Handle and execute long-running task such as upload and download.
 *
 * Tasks are stored in `this.tasks`. Only top-level tasks are listed, but all tasks should be part of a top-level
 * "grouped" task. It's useful to read and display the state of tasks at instant t.
 *
 * To handle task changes and real-time impacts on pages, the task scopes must be used.
 * Each task can declare (optionally) one or more object(s) that will be modified: these objects are the scope(s) of
 * the task. Each scope is represented under the form of an URI.
 * Each view can register a callback associated to a scope. When a task finish, all callbacks matching one of these
 * criteria are called:
 *  - The callback scope is the direct parent of the task scope.
 *  - The callback scope is the task scope.
 *  - The callback scope is a descendant of the task scope.
 *
 * Examples:
 *
 * The storage of id "deadbeaf" change its name. The scope of the task is "/storage/deadbeaf".
 * - The "/storage/" scope is triggered (direct child changed)
 * - The scope "/storage/deadbeaf/details" is triggered (descendant of "/storage/deadbeaf").
 * - Everything under "/storage/deadbeaf/browse" is triggered.
 *
 */
export default class TaskManager {

    constructor() {
        /** @type {PassphraseInput} */
        this.passphrase_input = new PassphraseInput();

        /**
         * List containing top-level registered tasks
         * Sub-tasks are not listed here.
         *
         * @type {BaseTask[]}
         */
        this.tasks = [];

        /**
         * List of tasks, referenced by the scope impacted (a string ID representing a page).
         *
         * @type {{}}
         */
        this.tasks_by_scope = {};
        this.callbacks_by_scope = {};

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

    /**
     * Start a new task and add it to the manager.
     *
     * @param task {BaseTask}
     * @param [is_subtask=false] {boolean} if true, the task is not added to the top-level task list.
     * @return {Promise} task promise.
     */
    start(task, is_subtask=false) {
        if (!is_subtask)
            this.tasks.push(task);
        this._register_task_to_scope(task);
        task.onchange = task => m.redraw();
        return task.start(this)
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
        scope = scope.replace(/\/$/, '');
        this.callbacks_by_scope[scope] = this.callbacks_by_scope[scope] || [];
        this.callbacks_by_scope[scope].push({
            owner,
            callback
        });
    }

    unregister_scope_callback(owner) {
        let is_not_owned_predicate = ctx => ctx.owner !== owner;
        for (let scope of Object.keys(this.callbacks_by_scope)) {
            this.callbacks_by_scope[scope] = this.callbacks_by_scope[scope].filter(is_not_owned_predicate);
            if (this.callbacks_by_scope[scope].length === 0)
                delete this.callbacks_by_scope[scope];
        }
    }

    /**
     * Get a regexp matching all impacted scopes
     *
     * @param scope {string} modified scope
     * @return {RegExp} regexp mathcing all impacted scopes.
     */
    _get_impacted_scope_regexp(scope) {
        scope = scope.replace(/\/$/, '');

        let path_parent = scope.split('/');
        let item = path_parent.pop();
        path_parent = path_parent.join('/');
        return new RegExp(`^${regexp_escape(path_parent)}(/${regexp_escape(item)}(/.*)?)?$`);
    }

    /**
     * @param scope {String}
     * @return {BaseTask[]}
     */
    get_tasks_impacted_by_scope(scope) {
        scope = scope.replace(/\/$/, '');
        let regexp = this._get_impacted_scope_regexp(scope);

        return Object.keys(this.tasks_by_scope)
            .filter(key => regexp.test(key))
            .reduce((result, key) => result.concat(this.tasks_by_scope[key]), []);
    }

    _register_task_to_scope(task) {
        let scope = task.get_scope();
        if (scope) {
            scope = scope.replace(/\/$/, '');
            this.tasks_by_scope[scope] = this.tasks_by_scope[scope] || [];
            this.tasks_by_scope[scope].push(task);
        }
    }

    _resolve_task_by_scope(task) {
        let scope = task.get_scope();
        if (!scope)
            return;

        scope = scope.replace(/\/$/, '');
        let scope_rel = this.tasks_by_scope[scope];

        scope_rel.splice(scope_rel.indexOf(task), 1);
        if (scope_rel.length === 0)
            delete this.tasks_by_scope[scope];

        let regexp = this._get_impacted_scope_regexp(scope);

        for (let impacted_scope of Object.keys(this.callbacks_by_scope)) {
            if (regexp.test(impacted_scope)) {
                for (let callback_ctx of this.callbacks_by_scope[impacted_scope]) {
                    try {
                        callback_ctx.callback(task);
                    } catch (err) {
                        console.error(`TaskManager: callback failed for scope ${impacted_scope}`, err);
                    }
                }
            }
        }
    }
}
