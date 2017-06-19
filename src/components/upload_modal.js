
import m from 'mithril';
import GroupedTasks from '../tasks/grouped_tasks';
import {TaskType} from '../tasks/base_task';
import {_} from '../utils/i18n';
import Modal from './modal';


export default class UploadModal {
    constructor() {
        this.files = [];
    }

    static make(file_selection, folder, task_manager) {
        return file_selection.show_upload_modal() ?
            m(UploadModal, {show_prop: file_selection.show_upload_modal, folder, task_manager}) :
            '';
    }

    view({attrs: {show_prop, folder, task_manager}}) {
        return Modal.make(show_prop,
            _('Upload files'), 'upload-modal', m('form#upload-form', {onsubmit: () => this._submit(folder, task_manager, show_prop)},
                m('.form-group', [
                    m('label[for=upload-file-input]', _('Select the file(s) you want to upload')),
                    m('input#upload-file-input[type=file][multiple].btn.btn-default', {onchange: evt => this._on_change(evt)})
                ])
            ), [
                m('button[type=submit][form=upload-form].btn.btn-primary', _('Send the file(s)'))
            ]
        );
    }

    _on_change(evt) {
        this.files = evt.target.files;
    }

    _submit(folder, task_manager, show_prop) {
        let tasks = Array.from(this.files).map(file => folder.upload(file));

        let task;
        if (tasks.length === 1)
            task = tasks[0];
        else
            task = new GroupedTasks(TaskType.UPLOAD, tasks,
                (task, ltpl) => ltpl`Upload of ${task.task_list.length} items`);

        task_manager.start(task);
        show_prop(false);
        return false;
    }
}
