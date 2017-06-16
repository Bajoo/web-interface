
import Folder from '../models/folder';
import {TaskType} from './base_task';
import GroupedTasks from './grouped_tasks';


export default class FolderUpload extends GroupedTasks {
    constructor(folder, fs_entry) {
        super(TaskType.UPLOAD);
        this.dest_folder = folder;
        this.fs_entry = fs_entry;
    }

    static is_supported() {
        // The DataTransferItem API is recent (not yet standardized)
        // It's not supported by all browsers.

        /* globals DataTransfer:false, DataTransferItem:false */
        return typeof DataTransfer !== 'undefined' &&
            typeof DataTransferItem !== 'undefined' &&
            'items' in DataTransfer.prototype && (
            'getAsEntry' in DataTransferItem.prototype ||
            'webkitGetAsEntry' in DataTransferItem.prototype);
    }

    get_description(ltpl = String.raw) {
        return ltpl`Upload of "${this.fs_entry.name}"`;
    }

    get_scope() {
        let base = `/storage/${this.dest_folder.storage.id}/browse`;
        if (this.dest_folder.fullname)
            return `${base}/${this.dest_folder.fullname}/${this.fs_entry.name}`;
        else
            return `${base}/${this.fs_entry.name}`;
    }

    _entry2task(folder, entry) {
        if (entry.isDirectory)
            return Promise.resolve(new FolderUpload(folder, entry));

        if (entry.isFile) {
            return new Promise((resolve, reject) =>
                entry.file(file => resolve(folder.upload(file)), reject)
            );
        }

        return Promise.reject(new Error('Unknown fs entry type', entry));
    }

    _start(task_manager) {
        let folder_name = this.dest_folder.fullname ? `${this.dest_folder.fullname}/${this.fs_entry.name}` : this.fs_entry.name;
        let folder = new Folder(this.dest_folder.storage, folder_name);

        let reader = this.fs_entry.createReader();

        return new Promise((resolve, reject) =>
            reader.readEntries(entries => {
                Promise.all(entries.map(entry =>
                    this._entry2task(folder, entry)
                        .catch(err => {
                            this.set_error(err);
                            return null;
                        })
                ))
                    .then(subtasks => {
                        this.task_list = subtasks.filter(t => t);
                        return super._start(task_manager);
                    })
                    .then(resolve, reject);
            }, reject)
        );
    }
}
