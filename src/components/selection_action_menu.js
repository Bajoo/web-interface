
import m from 'mithril';
import {SelectionAction} from '../view_models/file_selection';
import FolderCreationModal from './folder_creation_modal';


export default class SelectionActionMenu {

    static make(file_selection) {
        return m(SelectionActionMenu, {file_selection});
    }

    static _get_icon(action) {
        switch (action) {
            case SelectionAction.DELETE:
                return 'glyphicon-trash';
            case SelectionAction.CREATE_FOLDER:
                return 'glyphicon-folder-open';
            case SelectionAction.UPLOAD:
                return 'glyphicon-cloud-upload';
        }
    }

    view({attrs:{file_selection}}) {
        let available_actions = file_selection.available_actions();

        return m('div.action-zone', [
            file_selection.show_folder_creation_modal() ? FolderCreationModal.make(file_selection) : '',
            Object.values(SelectionAction).map(action =>
                m('a.menus-icons', {
                        onclick: () => (file_selection.execute(action), false),
                        class: available_actions.includes(action) ? '' : 'disabled'
                    }, m('span.glyphicon', {class: this.constructor._get_icon(action)})
                )
            )
        ]);
    }
}
