
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
     */
    constructor({attrs: {key, storage, status}}) {
        /** @type {Function} item comparator */
        this.sort_cmp = name_cmp;

        /** @type {boolean} sort order: ascendant (true) or descendant (false) */
        this.sort_ascendant = true;

        this.folder = new Folder(storage, {subdir: key});

        this.folder.onerror = err => {
            status.set_error(_l`Fetching file list failed: ${err.message || err}`);
            m.redraw();
        };

        this.folder.load_items().then(m.redraw, m.redraw);
    }

    onremove() {
        this.folder.onerror = null;
    }

    _sort_order_arrow(cmp) {
        return this.sort_cmp === cmp ?
            m(`i.glyphicon.glyphicon-triangle-${this.sort_ascendant ? 'bottom' : 'top'}`) :
            '';
    }

    /**
     * @param task_manager {TaskManager}
     */
    view({attrs: {task_manager}}) {
        return m('', this.folder.items === undefined ?
            m('#file-zone', _('Loading ...')) :
            Dropzone.make('#file-zone', file => task_manager.start(this.folder.upload(file)), [
                m('table.table.table-hover', [
                    m('thead', m('tr', [
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
                    m('tbody', this._sort(this.folder.items || []).map(
                        file => file instanceof Folder ?
                            FolderRow.make(file, task_manager) :
                            FileRow.make(file, task_manager))
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
