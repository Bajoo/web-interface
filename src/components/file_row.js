
import m from 'mithril';
import human_readable_bytes from '../view_helpers/human_readable_bytes';
import relative_date from '../view_helpers/relative_date';

export default class FileRow {

    /**
     * @param file {File}
     * @param task_manager {TaskManager}
     * @param file_selection {FileSelection}
     */
    static make(file, task_manager, file_selection) {
        return m(FileRow, {file, task_manager, file_selection, key: file.fullname});
    }

    /**
     * @param file {File}
     * @param task_manager {TaskManager}
     * @param file_selection {FileSelection}
     */
    view({attrs: {file, task_manager, file_selection}}) {
        return m('tr', {key: file.fullname}, [
            m('td', m('input[type=checkbox]', {
                checked: file_selection.is_selected(file),
                onchange: evt => evt.target.checked ? file_selection.select(file) : file_selection.deselect(file)
            })),
            m('td', m('i.glyphicon.glyphicon-file')),
            m('td', m('a[href=#]', {
                onclick: () => (task_manager.start(file.download()), false)
            }, file.name)),
            m('td', human_readable_bytes(file.bytes)),
            m('td', relative_date(file.last_modified))
        ]);
    }
}
