
import m from 'mithril';
import {_} from '../utils/i18n';
import Modal from './modal';
import TaskDetails from '../components/task_details';


export default class TaskListModal {

    /**
     * Create a TaskListModal (displayed only if `task_manager.show_task_list` is `true`).
     * @param task_manager {TaskManager}
     */
    static make(task_manager) {
        return m(TaskListModal, {show_prop: task_manager.show_task_list, task_manager});
    }

    view({attrs: {show_prop, task_manager}}) {
        return Modal.make(show_prop,
            _('Task list'), 'task-list-modal', [
                task_manager.tasks.length ? m('ul.list-group', task_manager.tasks.map(task =>
                    TaskDetails.make(task, task_manager)
                )) : _('There is no task')
            ]
        );
    }
}
