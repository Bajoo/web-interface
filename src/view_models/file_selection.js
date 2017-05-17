
import File from '../models/file';


export const SelectionAction = {
    DELETE: 'DELETE'
};


/**
 * Keep a list of file and/or folders selected by the user, and handle user actions on selection.
 */
export default class FileSelection {
    constructor() {
        this.items = [];
        this.loading = false;


        // reload callback
        this.reload = null;
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
        if (this.loading)
            return [];
        if (this.items.length !== 1 || !(this.items[0] instanceof File))
            return [];
        return [SelectionAction.DELETE];
    }

    execute(action) {
        if (this.loading)
            return;
        switch (action) {
            case SelectionAction.DELETE:
                return this._del();
        }
    }

    _del() {
        if (this.items.length !== 1 || !(this.items[0] instanceof File))
            return false;

        this.loading = true;
        let file = this.items[0];
        file.del() // TODO: handle errors
            .then(() => this.deselect(file))
            .then(() => this.loading = false, () => this.loading = true)
            .then(() => this.reload ? this.reload() : null);
    }
}
