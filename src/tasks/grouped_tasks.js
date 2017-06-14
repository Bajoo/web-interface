
import {default as BaseTask, TaskStatus} from './base_task';


/**
 * Task composed of many tasks executed in the same context.
 *
 * It groups tasks together to keep the same structure as the user's actions: if the user uploads 5 files at once,
 * A single GroupedTasks is created (containing 5 upload sub-tasks).
 *
 * This class be used either in a standalone way, or by inheritance.
 *
 *  -In "standalone" mode, all sub-tasks must be passed at construction. Starting the GroupedTasks will start each one
 *  of these sub-tasks. A description should be passed at construction to describe the action.
 *
 *  - With inheritance, it's possible for the child class to create itself the sub-tasks dynamically. It should
 *  override `_start()` to create all sub-tasks wanted, then call `super._start()` to executed them.
 */
export default class GroupedTasks extends BaseTask {

    constructor(task_list = null, description=null) {
        super();

        /**
         * list of subtasks.
         *
         * @type {BaseTask[]}
         */
        this.task_list = task_list || [];

        /**
         * @type {Function}
         *
         * Function overriding `get_description` is set.
         *
         * The purpose of this property is to allow to create custom GroupedTasks-based tasks without the burden of
         * creating a whole child class. The description is often the only thing customized (and it can't be a string
         * attribute because of the i18n support).
         */
        this.description = description;
    }

    /**
     * Return a few words describing the task.
     * @param [ltpl=String.raw] literal template (used for i18n)
     * @returns {string}
     */
    get_description(ltpl = String.raw) {
        if (this.description)
            return this.description(this, ltpl);
        return ltpl`Group of ${this.task_list.length} tasks`;
    }

    has_unexpected_errors() {
        return super.has_unexpected_errors() || this.task_list.some(task => task.has_unexpected_errors());
    }

    _start(task_manager) {
        this.set_status(TaskStatus.SUBTASK_EXECUTION);

        // TODO: should we throw errors ?
        return Promise.all(this.task_list.map(task => task_manager.start(task, true)
            .catch(() => {})));
    }
}
