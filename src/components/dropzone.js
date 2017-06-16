
import m from 'mithril';
import {TaskType} from '../tasks/base_task';
import FolderUpload from '../tasks/folder_upload';
import GroupedTasks from '../tasks/grouped_tasks';


/**
 * HTML tag which can receive files during an drag&drop operation.
 */
export default class Dropzone {
    constructor() {
        // If drag_enter > 0, the user drags a file over this dropzone.
        // We must keep track of the changes, because the browser send 'leave' events when entering on child elements.
        this.drag_enter = 0;
    }

    /**
     * @param tag {string}
     * @param task_manager {TaskManager}
     * @param folder {Folder} folder in which the files will be dropped
     * @param children
     */
    static make(tag, task_manager, folder, children) {
        return m(Dropzone, {html_tag: tag, task_manager, folder}, children);
    }

    /**
     * @param [html_tag='']{string} 1st value passed to `m()`. If not set '' is used (producing a div).
     * @param task_manager {TaskManager}
     * @param folder {Folder} folder in which the files will be dropped
     * @param children children's component
     */
    view({attrs: {html_tag = '', task_manager, folder}, children}) {
        return m(html_tag, {
            class: this.drag_enter > 0 ? 'dropzone' : '',
            ondragover: evt => {
                evt.redraw = false;
                if (evt.dataTransfer.types.indexOf('Files') > -1) {
                    evt.stopPropagation();
                    evt.preventDefault();
                }
            },
            ondragenter: evt => {
                if (evt.dataTransfer.types.indexOf('Files') > -1) {
                    evt.stopPropagation();
                    evt.preventDefault();
                    this.drag_enter++;
                }

                if (this.drag_enter !== 1)
                    evt.redraw = false;
            },
            ondragleave: evt => {
                if (this.drag_enter !== 1)
                    evt.redraw = false;
                if (evt.dataTransfer.types.indexOf('Files') > -1) {
                    evt.stopPropagation();
                    evt.preventDefault();
                    this.drag_enter--;
                }
            },
            ondrop: evt => {
                this.drag_enter = 0;
                if (evt.dataTransfer.files.length) {
                    evt.stopPropagation();
                    evt.preventDefault();

                    this._upload(task_manager, folder, evt.dataTransfer);
                }
            }
        }, children);
    }

    _upload(task_manager, folder, data_transfer) {
        if (data_transfer.files.length === 0)
            return;

        let tasks;
        if (FolderUpload.is_supported()) {
            tasks = Array.from(data_transfer.items)
                .filter(item => item.kind === 'file')
                .map(item => {
                    let entry = 'getAsEntry' in item ? item.getAsEntry() : item.webkitGetAsEntry();
                    if (entry.isFile)
                        return folder.upload(entry.getAsFile());
                    else
                        return new FolderUpload(folder, entry);
                });
        } else {
            tasks = Array.from(data_transfer.files).map(file => folder.upload(file));
        }

        let task;
        if (tasks.length === 1)
            task = tasks[0];
        else
            task = new GroupedTasks(TaskType.UPLOAD, tasks,
                (task, ltpl) => ltpl`Upload of ${task.task_list.length} items`);

        task_manager.start(task);
    }
}
