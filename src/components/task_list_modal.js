
import m from 'mithril';
import {_, _l} from '../utils/i18n';
import Modal from './modal';
import Download from '../tasks/download';
import Upload from '../tasks/upload';
import {TaskStatus} from '../tasks/base_task';
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


export default class TaskListModal {

    /**
     * Create a TaskListModal (displayed only if `task_manager.show_task_list` is `true`).
     * @param task_manager {TaskManager}
     */
    static make(task_manager) {
        return m(TaskListModal, {show_prop: task_manager.show_task_list, task_manager});
    }

    _task2icon(task) {
        switch (true) {
            case task instanceof Download:
                return 'glyphicon-cloud-download';
            case task instanceof Upload:
                return 'glyphicon-cloud-upload';
            default:
                return 'glyphicon-wrench';
        }
    }

    _task2class(task) {
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

    _task2status(task) {
        if (task.is_canceled())
            return _('Cancelled!');
        return _(status2msg[task.status]);
    }

    _display_error(err) {
        return err instanceof TaskError ?
            err.toString() :
            (err.message || err.toString());
    }

    view({attrs: {show_prop, task_manager}}) {
        return Modal.make(show_prop,
            _('Task list'), 'task-list-modal', [
                task_manager.tasks.length ? m('ul.list-group', task_manager.tasks.map(task =>
                    m('li.list-group-item.task-item-list', {class: this._task2class(task)},
                        m('.task-progressbar.media',
                            {style: task.progress !== null ?
                                `background: linear-gradient(to right, transparent ${task.progress * 100}%, #ffffff7f ${task.progress * 100}%)` :
                                ''
                            }, [
                                m('.media-left.media-middle', m('span.glyphicon', {class: this._task2icon(task)})),
                                m('.media-body', [
                                    task.get_description(),
                                    ' - ',
                                    this._task2status(task),
                                    task.has_unexpected_errors() && task.errors.length ? [
                                        m('br'),
                                        task.errors.length === 1 ?
                                            _l`Error: ${this._display_error(task.errors[0])}` :
                                            [
                                                _l`${task.errors.length} errors:`,
                                                m('ul', task.errors.map(err =>
                                                    m('li', this._display_error(err))
                                                ))
                                            ]
                                    ] : ''
                                ]),
                                task.is_done() ?
                                    m('.media-right.media-middle',
                                        m('button.close[type=button]', {onclick: () => task_manager.clean_task(task)}, m.trust('&times;'))
                                    )
                                    : ''
                            ])
                    )
                )) : _('There is no task')
            ]
        );
    }
}
