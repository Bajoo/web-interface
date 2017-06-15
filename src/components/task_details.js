
import m from 'mithril';
import {_, _l} from '../utils/i18n';
import GroupedTasks from '../tasks/grouped_tasks';
import {TaskStatus, TaskType} from '../tasks/base_task';
import {TaskError} from '../models/task_errors';


const status2msg = {
    [TaskStatus.GET_USER_KEY]: 'Fetch user key ...',
    [TaskStatus.WAIT_FOR_PASSPHRASE]: 'Wait for passphrase ...',
    [TaskStatus.LISTING_DIRECTORY]: 'Listing directory ...',
    [TaskStatus.SUBTASK_EXECUTION]: 'Execution of sub-tasks ...',
    [TaskStatus.PREPARE_FILE]: 'Read file content ...',
    [TaskStatus.ENCRYPT_FILE]: 'Encrypt file ...',
    [TaskStatus.DECRYPT_FILE]: 'Decrypt file ...',
    [TaskStatus.GET_STORAGE_KEY]: 'Fetch storage key ...',
    [TaskStatus.DOWNLOAD_FILE]: 'Download file from server ...',
    [TaskStatus.UPLOAD_FILE]: 'Upload file to server...',
    [TaskStatus.ONGOING]: 'Ongoing ...',
    [TaskStatus.FINALIZE]: 'Finalize file ...',
    [TaskStatus.DONE]: 'Done!',
};


export default class TaskDetails {

    constructor() {
        this.hide_child = true;
    }

    static make(task, task_manager, is_subtask=false) {
        return m(TaskDetails, {task, task_manager, is_subtask});
    }

    static _get_class(task) {
        if (task.is_canceled())
            return 'task-canceled';

        let class_list = [];
        if (task.has_unexpected_errors())
            class_list.push('task-error');

        if (task.is_done())
            class_list.push('task-done');
        else
            class_list.push('task-progress');
        return class_list.join(' ');
    }

    static _get_icon(task) {
        switch (task.type) {
            case TaskType.DOWNLOAD:
                return 'glyphicon-cloud-download';
            case TaskType.UPLOAD:
                return 'glyphicon-cloud-upload';
            case TaskType.DELETION:
                return 'glyphicon-trash';
            default:
                return 'glyphicon-wrench';
        }
    }

    static _get_status(task) {
        if (task.is_canceled())
            return _('Cancelled!');
        return _(status2msg[task.status]);
    }

    static _display_error(err) {
        return err instanceof TaskError ?
            err.toString() :
            (err.message || err.toString());
    }

    view({attrs: {task, task_manager, is_subtask}}) {
        let folding_child_list = task instanceof GroupedTasks && task.task_list.length;

        return m('li.list-group-item.task-item-list', {class: this.constructor._get_class(task)}, [
            m('.task-progressbar.media',
                {style: task.progress !== null ?
                    `background: linear-gradient(to right, transparent ${task.progress * 100}%, #ffffff7f ${task.progress * 100}%)` :
                    ''
                }, [
                    m('.media-left.media-middle', {
                        onclick: folding_child_list ? () => {this.hide_child = !this.hide_child;} : null,
                        class: folding_child_list ? 'folding-handle' : ''
                    }, m('span.glyphicon', {class: this.constructor._get_icon(task)})),
                    m('.media-body', [
                        task.get_description(_l),
                        ' - ',
                        this.constructor._get_status(task),
                        task.has_unexpected_errors() && task.errors.length ? [
                            m('br'),
                            task.errors.length === 1 ?
                                _l`Error: ${this.constructor._display_error(task.errors[0])}` :
                                [
                                    _l`${task.errors.length} errors:`,
                                    m('ul', task.errors.map(err =>
                                        m('li', this.constructor._display_error(err))
                                    ))
                                ]
                        ] : ''
                    ]),
                    task.is_done() && !is_subtask ?
                        m('.media-right.media-middle',
                            m('button.close[type=button]', {onclick: () => task_manager.clean_task(task)}, m.trust('&times;'))
                        )
                        : ''
                ]),
            !this.hide_child && task instanceof GroupedTasks && task.task_list.length ?
                m('ul', task.task_list.map(task => TaskDetails.make(task, task_manager, true))) : ''
        ]);
    }
}
