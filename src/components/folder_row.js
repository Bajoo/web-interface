
import m from 'mithril';
import Dropzone from './dropzone';


export default class FolderRow {

    /**
     * @param folder {Folder}
     * @param task_manager {TaskManager}
     */
    static make(folder, task_manager) {
        return m(FolderRow, {folder, task_manager, key: folder.fullname});
    }

    /**
     * @param folder {Folder}
     * @param task_manager {TaskManager}
     */
    view({attrs: {folder, task_manager}}) {
        return Dropzone.make('tr.folder-row', f => task_manager.start(folder.upload(f)), [
            m('td', m('i.glyphicon.glyphicon-folder-open')),
            m('td', m('a', {oncreate: m.route.link, href: `${m.route.get()}/${folder.name}`}, folder.name)),
            m('td', '-'),
            m('td', '-')
        ]);
    }
}
