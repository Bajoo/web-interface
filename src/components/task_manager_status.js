
import m from 'mithril';
import {TaskStatus} from '../tasks/base_task';
import {_3l} from '../utils/i18n';


/**
 * Task status located in the top menu.
 *
 * Display the global state of the tasks: number of ongoing task, total number of task,
 * A progression bar (when possible) and eventually the type of task.
 * It's also a link to open the task list modal.
 */
export default class TaskManagerStatus {
    static make(task_manager) {
        return task_manager.tasks.length ? m(TaskManagerStatus, {task_manager}) : '';
    }

    view({attrs: {task_manager}}) {

        let total_tasks = task_manager.tasks.length;
        let tasks_done = task_manager.tasks.filter(t => t.status === TaskStatus.DONE || t.status === TaskStatus.ABORTED).length;
        let has_error = task_manager.tasks.some(t => t.has_unexpected_errors());

        let class_list = [
            tasks_done === total_tasks ? 'task-done' : 'task-progress',
            has_error ? 'task-error' : ''
        ];

        return m('#task-manager-status', {
            onclick: () => task_manager.show_task_list(true),
            class: class_list.join(' ')
        }, [
            has_error ? [m('span.glyphicon.glyphicon-alert'), ' '] : '',
            tasks_done === total_tasks ?
                _3l(total_tasks)`${total_tasks} task(s) done` :
                _3l(total_tasks)`Task(s): ${tasks_done} / ${total_tasks}`,
            (!has_error) && tasks_done === total_tasks ? [' ', m('span.glyphicon.glyphicon-ok')] : ''
        ]);
    }
}
