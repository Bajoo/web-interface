
import File from '../models/file';
import {FolderListingError} from '../models/task_errors';
import {TaskStatus} from './base_task';
import GroupedTasks from './grouped_tasks';

import FileDeletion from './file_deletion';


export default class FolderDeletion extends GroupedTasks {

    constructor(item) {
        super();

        /** @type Folder */
        this.item = item;
    }

    /**
     * Return a few words describing the task.
     * @param [ltpl=String.raw] literal template (used for i18n)
     * @returns {string}
     */
    get_description(ltpl = String.raw) {
        if (this.item)
            return ltpl`Deletion of "${this.item.name}"`;
    }

    get_scope() {
        return `/storage/${this.item.storage.id}/browse/${this.item.fullname}`;
    }

    // jshint ignore:start
    async _start(task_manager) {
        this.set_status(TaskStatus.LISTING_DIRECTORY);
        let files = [];
        try {
            files = await this.item.load_items(true);
        } catch (err) {
            throw new FolderListingError(this, this.item, err);
        }
        this.task_list = files.map(item => item instanceof File ? new FileDeletion(item) : new FolderDeletion(item));
        await super._start(task_manager);
    }
    // jshint ignore:end
}
