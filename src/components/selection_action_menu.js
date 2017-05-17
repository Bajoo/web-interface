
import m from 'mithril';
import {SelectionAction} from '../view_models/file_selection';



export default class SelectionActionMenu {

    static make(file_selection) {
        return m(SelectionActionMenu, {file_selection});
    }

    view({attrs:{file_selection}}) {
        let available_actions = file_selection.available_actions();

        //TODO: loop over Object.keys(SelectionAction) and display an icon for each.
        return m('div.action-zone', [
            m('a.menus-icons', {
                onclick: () => (file_selection.execute(SelectionAction.DELETE), false),
                class: available_actions.includes(SelectionAction.DELETE) ? '' : 'disabled'
            }, m('span.glyphicon.glyphicon-trash'))
        ]);
    }
}
