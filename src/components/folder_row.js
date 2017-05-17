
import m from 'mithril';
import Dropzone from './dropzone';


export default class FolderRow {

    /**
     * @param folder {Folder}
     * @param task_manager {TaskManager}
     * @param file_selection {FileSelection}
     */
    static make(folder, task_manager, file_selection) {
        return m(FolderRow, {folder, task_manager, file_selection, key: folder.fullname});
    }

    /**
     * @param folder {Folder}
     * @param task_manager {TaskManager}
     * @param file_selection {FileSelection}
     */
    view({attrs: {folder, task_manager, file_selection}}) {
        return Dropzone.make('tr.folder-row', f => task_manager.start(folder.upload(f)), [
            m('td', m('input[type=checkbox]', {
                checked: file_selection.is_selected(folder),
                onchange: evt => evt.target.checked ? file_selection.select(folder) : file_selection.deselect(folder)
            })),
            m('td', m('i.glyphicon.glyphicon-folder-open')),
            m('td', m('a', {oncreate: m.route.link, href: `${m.route.get()}/${folder.name}`}, folder.name)),
            m('td', '-'),
            m('td', '-')
        ]);
    }
}
