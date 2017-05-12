
import m from 'mithril';
import {_} from '../utils/i18n';
import Modal from './modal';
import Download from '../models/download';
import Upload from '../models/upload';
import {TaskStatus} from '../models/base_task';


const status2msg = {
    [TaskStatus.GET_USER_KEY]: _('Fetch user key ...'),
    [TaskStatus.WAIT_FOR_PASSPHRASE]: _('Wait for passphrase ...'),
    [TaskStatus.PREPARE_FILE]: _('Read file content ...'),
    [TaskStatus.ENCRYPT_FILE]: _('Encrypt file ...'),
    [TaskStatus.DECRYPT_FILE]: _('Decrypt file ...'),
    [TaskStatus.GET_STORAGE_KEY]: _('Fetch storage key ...'),
    [TaskStatus.DOWNLOAD_FILE]: _('Download file from server ...'),
    [TaskStatus.UPLOAD_FILE]: _('Upload file to server...'),
    [TaskStatus.FINALIZE]: _('Finalize file ...'),
    [TaskStatus.DONE]: _('Done!'),
    [TaskStatus.ERROR]: _('Error!'),
    [TaskStatus.ABORTED]: _('Cancelled!')
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
                            status2msg[task.status],

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
