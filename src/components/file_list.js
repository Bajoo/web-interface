
import m from 'mithril';
import Dropzone from '../components/dropzone';
import FileRow from '../components/file_row';
import FolderRow from '../components/folder_row';
import Folder from '../models/folder';
import {_, _l} from '../utils/i18n';


const size_cmp = (a, b) => (a.bytes || 0) - (b.bytes || 0);
const name_cmp = (a, b) => a.name.localeCompare(b.name);
const date_cmp = (a, b) => (a.last_modified || new Date(0)) > (b.last_modified || new Date(0));


export default class FileList {
    /**
     * @param [key=''] {string} path of the folder, relative to the container. It should have no trailing slash.
     * @param storage {Storage} storage containing the files.
     * @param status {Status}
     * @param task_manager {TaskManager}
     * @param file_selection {FileSelection}
     */
    constructor({attrs: {key, storage, status, task_manager, file_selection}}) {
        /** @type {Function} item comparator */
        this.sort_cmp = name_cmp;

        /** @type {boolean} sort order: ascendant (true) or descendant (false) */
        this.sort_ascendant = true;

        this.folder = new Folder(storage, key);

        this._load_folder(status);

        file_selection.reload = () => this._load_folder(status);
        file_selection.clear();

        let scope = decodeURIComponent(m.route.get());
        task_manager.register_scope_callback(scope, this, null, () => this._load_folder(status));
    }

    onremove({attrs: {file_selection, storage, task_manager}}) {
        this.folder.onerror = null;
        // TODO: remove file_selection.reload
        // Warning: onremove() can be called after the next FileList creation (and thus, we could erase the new callback).
        //file_selection.reload = null;
        task_manager.unregister_scope_callback(this);
    }

    _load_folder(status) {
        this.folder.load_items().then(m.redraw, err => {
            status.set_error(_l`Fetching file list failed: ${err.message || err}`);
            m.redraw();
        });
    }

    _sort_order_arrow(cmp) {
        return this.sort_cmp === cmp ?
            m(`i.glyphicon.glyphicon-triangle-${this.sort_ascendant ? 'bottom' : 'top'}`) :
            '';
    }

    /**
     * @param task_manager {TaskManager}
     * @param file_selection {FileSelection}
     */
    view({attrs: {task_manager, file_selection}}) {
        return m('', !this.folder.items ?
            m('#file-zone', _('Loading ...')) :
            Dropzone.make('#file-zone', task_manager, this.folder, [
                m('table.table.table-hover', [
                    m('thead', m('tr', [
                        m('th', m('input[type=checkbox]', {
                            checked: file_selection.all_selected(this.folder.items),
                            onchange: evt => evt.target.checked ? file_selection.select_all(this.folder.items) : file_selection.clear()
                        })),
                        m('th'),
                        m('th', {onclick: () => this._sort_order(name_cmp)}, [
                            _('Name'),
                            this._sort_order_arrow(name_cmp)
                        ]),
                        m('th', {onclick: () => this._sort_order(size_cmp)}, [
                            _('Size'),
                            this._sort_order_arrow(size_cmp)
                        ]),
                        m('th', {onclick: () => this._sort_order(date_cmp)}, [
                            _('Last modification'),
                            this._sort_order_arrow(date_cmp)
                        ])
                    ])),
                    m('tbody', this._sort(this.folder.items).map(
                        file => file instanceof Folder ?
                            FolderRow.make(file, task_manager, file_selection) :
                            FileRow.make(file, task_manager, file_selection))
                    )
                ]),
                (this.folder.items && this.folder.items.length === 0) ?
                    m('.jumbotron.empty-box', m('p', _('This folder is empty'))) :
                    ''
            ]));
    }

    _sort(items) {
        return this.sort_ascendant ? Array.from(items).sort(this.sort_cmp) : Array.from(items).sort(this.sort_cmp).reverse();
    }

    _sort_order(cmp) {
        if (this.sort_cmp !== cmp) {
            this.sort_cmp = cmp;
            this.sort_ascendant = true;
        } else
            this.sort_ascendant = !this.sort_ascendant;
    }
}
