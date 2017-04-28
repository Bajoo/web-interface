
import m from 'mithril';
import human_readable_bytes from '../view_helpers/human_readable_bytes';
import relative_date from '../view_helpers/relative_date';

export default class FileRow {
    constructor() {
        /**
         * download action. If null, there is no ongoing download.
         * @type {?Download}
         */
        this.download = null;
    }

    /**
     * @param file {File}
     * @param task_manager {TaskManager}
     */
    static make(file, task_manager) {
        return m(FileRow, {file, task_manager, key: file.fullname});
    }

    /**
     * @param file {File}
     * @param task_manager {TaskManager}
     */
    view({attrs: {file, task_manager}}) {
        return m('tr', {key: file.fullname}, [
            m('td', m('i.glyphicon.glyphicon-file')),
            m('td', m('a[href=#]', {
                onclick: () => (task_manager.start(file.download()), false)
            }, file.name)),
            m('td', human_readable_bytes(file.bytes)),
            m('td', relative_date(file.last_modified))
        ]);
    }
}
