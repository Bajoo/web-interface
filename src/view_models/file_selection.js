
import {_} from '../utils/i18n';
import prop from '../utils/prop';
import File from '../models/file';
import {TaskType} from '../tasks/base_task';
import FileDeletion from '../tasks/file_deletion';
import FolderDeletion from '../tasks/folder_deletion';
import GroupedTasks from '../tasks/grouped_tasks';


export const SelectionAction = {
    DELETE: 'DELETE',
    CREATE_FOLDER: 'CREATE_FOLDER'
};


/**
 * Keep a list of file and/or folders selected by the user, and handle user actions on selection.
 */
export default class FileSelection {
    constructor(task_manager) {
        this.items = [];

        this.task_manager = task_manager;

        /** @type {prop} if true, display the folder creation modal */
        this.show_folder_creation_modal = prop(false);
    }

    all_selected(items) {
        // TODO: it's a hack, not a real cmp!
        return this.items.length === items.length;
    }

    clear() {
        this.items = [];
    }

    select_all(items) {
        this.items = Array.from(items);
    }

    is_selected(item) {
        return this.items.includes(item);
    }

    select(item) {
        if (!this.is_selected(item))
            this.items.push(item);
    }

    deselect(item) {
        let idx = this.items.indexOf(item);
        if (idx !== -1)
            this.items.splice(idx, 1);
    }

    available_actions() {
        let actions = [
            SelectionAction.CREATE_FOLDER
        ];

        if (this.items.length !== 0) {
            actions.push(SelectionAction.DELETE);
        }
        return actions;
    }

    execute(action) {
        let res = false;
        switch (action) {
            case SelectionAction.DELETE:
                res = this._del();
                break;
            case SelectionAction.CREATE_FOLDER:
                this.show_folder_creation_modal(true);
                break;
        }
        if (res)
            this.clear();
    }

    _deletion_task_builder(item) {
        return item instanceof File ? new FileDeletion(item) : new FolderDeletion(item);
    }

    _del() {
        if (this.items.length === 0)
            return false;

        if (!window.confirm(_('Are you sure to delete these files ?')))
            return false;

        let task = null;
        if (this.items.length === 1)
            task = this._deletion_task_builder(this.items[0]);
        else
            task = new GroupedTasks(TaskType.DELETION, this.items.map(item => this._deletion_task_builder(item)),
                (task, ltpl) => ltpl`Deletion of ${task.task_list.length} items`);

        this.task_manager.start(task);
        return true;
    }
}
