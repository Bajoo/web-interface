
import m from 'mithril';
import folder_row from '../components/folder_row';
import  human_readable_bytes from '../view_helpers/human_readable_bytes';
import relative_date from '../view_helpers/relative_date';


function file_row(file, passphrase_input) {
    return m('tr', {key: file.name}, [
        m('td', m('i.glyphicon.glyphicon-file')),
        m('td', m('a[href=#]', {onclick: () => {file.download({passphrase_input}); return false;}}, file.name)),
        m('td', human_readable_bytes(file.bytes)),
        m('td', relative_date(file.last_modified))
    ]);
}


/**
 * Attributes:
 *  storage {Storage} storage containing the files.
 *  key {string} path of the folder, relative to the container. It should have no trailing slash.
 */
export default {
    oninit(vnode) {
        this.file_list = null;

        this.sort_order = null;
        this.sort_order_asc = true;

        vnode.attrs.storage.list_files(vnode.attrs.key).then(list => {
            this.file_list = list;
            m.redraw();
        })
            .catch(err => console.log(err));
    },

    _sort_order_arrow(order_type) {
        if (this.sort_order === order_type)
            return this.sort_order_asc ?
                m('i.glyphicon.glyphicon-triangle-bottom') :
                m('i.glyphicon.glyphicon-triangle-top');
        return '';
    },

    view(vnode) {
        return m('', [
            m('table.table.table-hover', [
                m('thead', m('tr', [
                    m('th'),
                    m('th', {onclick: () => this.sort_by_name()}, [
                        'Name',
                        this._sort_order_arrow('name')
                    ]),
                    m('th', {onclick: () => this.sort_by_size()}, [
                        'Size',
                        this._sort_order_arrow('size')
                    ]),
                    m('th', {onclick: () => this.sort_by_date()}, [
                        'Last modification',
                        this._sort_order_arrow('date')
                    ])
                ])),
                m('tbody', this.file_list ? this.file_list.map(
                    file => file.constructor.name === 'Folder' ?
                        m(folder_row, {folder: file, passphrase_input: vnode.attrs.passphrase_input}) :
                        file_row(file, vnode.attrs.passphrase_input)
                ) : '')
            ]),
            this.file_list === null ? m('', 'Loading ...') : (
                this.file_list.length === 0 ? m('.jumbotron.empty-folder', m('p', 'This folder is empty')) : ''
            )
        ]);
    },

    _sort_order(order_type, cmp) {
        if (this.sort_order !== order_type) {
            this.sort_order = order_type;
            this.sort_order_asc = true;
        } else
            this.sort_order_asc = !this.sort_order_asc;

        this.file_list = this.file_list.sort(cmp);

        if (!this.sort_order_asc)
            this.file_list = this.file_list.reverse();
    },

    sort_by_size() {
        return this._sort_order('size', (a, b) => (a.bytes || 0) - (b.bytes || 0));
    },

    sort_by_name() {
        return this._sort_order('name', (a, b) => (a.name || a.subdir).localeCompare(b.name || b.subdir));
    },

    sort_by_date() {
        return this._sort_order('date', (a, b) => (a.last_modified || new Date(0)) > (b.last_modified || new Date(0)));
    }
};
