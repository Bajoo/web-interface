
import m from 'mithril';
import app from '../app';
import relative_date from '../helpers/relative_date';
import Storage from '../models/storage';


function breadcrumb(storage, path) {
    let acc_path = `/storage/${storage.id}`;
    let folder_list = path.split('/').filter(f => f !== '');

    return m('ol.breadcrumb', [
        folder_list.length > 0 ?
            m('li', m('a', {oncreate: m.route.link, href: `/storage/${storage.id}`}, storage.name)) :
            m('li.active', storage.name),
        folder_list.map((folder, idx) => {
            let is_last = (idx == folder_list.length - 1);
            acc_path = `${acc_path}/${folder}`;
            return (idx == folder_list.length - 1) ?
                m('li.active', folder) :
                m('li', m('a', {oncreate: m.route.link, href: acc_path}, folder));
        })
    ]);
}

function folder_row(folder) {
    return m('tr', [
        m('td', m('i.glyphicon.glyphicon-folder-open')),
        m('td', m('a', {oncreate: m.route.link, href: `${m.route.get()}/${folder.subdir}`}, folder.subdir)),
        m('td', '-'),
        m('td', '-')
    ]);
}

export default {

    oninit(vnode) {
        this.storage = null;

        this.file_list = [];

        // 1. Load storage infos
        let p = Storage.get(app.session, vnode.attrs.key)
            .then(storage => this.storage = storage)
            .then(m.redraw);

        // 2. Load storage content list
        p.then(() => {
            return  this.storage.list_files(app.session);
        })
        .then(list => {
            this.file_list = list;
            m.redraw();
        })
        .catch(err => console.log(err));
    },

    view(vnode) {
        return m('.wall', [
            m('h1', this.storage ? breadcrumb(this.storage, vnode.attrs.path || '') : '???'),
            m('table.table.table-hover', [
                m('thead', m('tr', [
                    m('th'),
                    m('th', 'Name'),
                    m('th', 'Size'),
                    m('th', 'Last modification')
                ])),
                m('tbody', this.file_list.map(
                    file => file.subdir ? folder_row(file) : m('tr', [
                        m('td', m('i.glyphicon.glyphicon-file')),
                        m('td', file.name),
                        m('td', file.bytes),
                        m('td', relative_date(file.last_modified))
                    ]))
                 )
            ])
        ]);
    }
};


// bak+T15@bajoo.fr