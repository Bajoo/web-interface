
import BaseTask from './base_task';
import {FileDeletionError} from '../models/task_errors';


export default class FileDeletion extends BaseTask {

    constructor(item) {
        super();

        /** @type {File} */
        this.item = item;
    }

    /**
     * Return a few words describing the task.
     * @param [ltpl=String.raw] literal template (used for i18n)
     * @returns {string}
     */
    get_description(ltpl = String.raw) {
        return ltpl`Deletion of "${this.item.name}"`;
    }

    get_scope() {
        return `/storage/${this.item.storage.id}/browse/${this.item.fullname}`;
    }

    _start() {
        return this.item.del().catch(err => {
            throw new FileDeletionError(this, this.item, err);
        });
    }
}
