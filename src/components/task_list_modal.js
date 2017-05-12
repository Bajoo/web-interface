
import m from 'mithril';
import {_} from '../utils/i18n';
import Modal from './modal';
import Download from '../models/download';
import Upload from '../models/upload';
import {TaskStatus} from '../models/base_task';


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
    [TaskStatus.DONE]: 'Done!',
    [TaskStatus.ERROR]: 'Error!',
    [TaskStatus.ABORTED]: 'Cancelled!'
};


export default class TaskListModal {
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
                return 'glyphicon-play-circle';
        }
    }

    _task2class(task) {
        switch (task.status) {
            case TaskStatus.ERROR:
                return 'task-error';
            case TaskStatus.DONE:
                return 'task-done';
            case TaskStatus.ABORTED:
                return 'task-aborted';
            default:
                return 'task-progress';
        }
    }

    view({attrs: {show_prop, task_manager}}) {
        return Modal.make(show_prop,
            _('Task list'), 'task-list-modal', [
                task_manager.tasks.length ? m('ul.list-group', task_manager.tasks.map(task =>
                    m('li.list-group-item.task-item-list', {class: this._task2class(task)}, m('.task-progressbar',
                        {style: task.progress !== null ?
                            `background: linear-gradient(to right, transparent ${task.progress * 100}%, #ffffff7f ${task.progress * 100}%)` :
                            ''
                        }, [
                            m('span.glyphicon', {class: this._task2icon(task)}),
                            ' ',
                            _(task.get_name()),
                            ' - ',
                            task.get_target(),
                            ' - ',
                            _(status2msg[task.status]),

                            task.ended() ?
                                m('button.close', {onclick: () => task_manager.clean_task(task)}, m.trust('&times;'))
                                : ''
                        ])
                    )
                )) : _('There is no task')
            ]
        );
    }
}
