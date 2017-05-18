
import m from 'mithril';
import {_} from '../utils/i18n';
import loader from '../utils/loader';
import side_menu from './side_menu';
import DisconnectButton from './disconnect_button.js';
import LanguageMenu from './language_menu.js';
import PassphraseInputModal from './passphrase_input_modal';
import TaskListModal from './task_list_modal';
import TaskManagerStatus from './task_manager_status';


function two_column_content(user, content) {
    return m('div.row', [
        m('.col-md-2[role="nav"]', m(side_menu, {user: user})),
        m('.col-md-10[role="main"]', content)
    ]);
}

/**
 * A mithril component wrapping its children around a layout common to all pages.
 */
export default class Layout {
    /**
     * @param app {Application}: reference to the Application instance.
     * @param children
     */
    view({attrs: {app}, children}) {
        return m('', [
            m('header', [
                m('nav.navbar.navbar-default', [
                    m('.container-fluid', [
                        m('.navbar-header',
                            // TODO: navbar-brand declares a forced, hard-coded height value.
                            // Custom CSS should be added.
                            m('a.navbar-brand[href=#]',
                                m('img[width=100]', {src: loader('bajoo-logo.png')})
                            )
                        ),
                        m('.navbar-collapse', [
                            m('p.navbar-text', 'Bajoo web interface'),
                            LanguageMenu.make(),
                            app.is_logged ? DisconnectButton.make(() => app.reset()) : '',
                            TaskManagerStatus.make(app.task_manager),
                            TaskListModal.make(app.task_manager),
                            PassphraseInputModal.make(app.task_manager.passphrase_input)
                        ])
                    ])
                ])
            ]),
            m('.container',
                app.is_logged === null ?
                    _('Connection ...') :
                    (
                        app.is_logged ? two_column_content(app.user, children) : children
                    )
            )
        ]);
    }
}
