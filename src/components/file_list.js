
import m from 'mithril';
import app from '../app';
import relative_date from '../helpers/relative_date';


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
        this.file_list = [];
        
        vnode.attrs.storage.list_files(app.session, vnode.attrs.key).then(list => {
            this.file_list = list;
            m.redraw();
        })
        .catch(err => console.log(err));
    },
    
    view() {
        return m('table.table.table-hover', [
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
        ]);
    }
};
