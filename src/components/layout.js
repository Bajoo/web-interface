
import m from 'mithril';
import {_} from '../utils/i18n';
import loader from '../utils/loader';
import prop from '../utils/prop';
import StorageNav from './storage_nav';
import StaticLinksNav from './static_links_nav.js';
import LanguageMenu from './language_menu.js';
import LateralMenu from './lateral_menu.js';
import PassphraseInputModal from './passphrase_input_modal';
import TaskListModal from './task_list_modal';
import TaskManagerStatus from './task_manager_status';


/**
 * A mithril component wrapping its children around a layout common to all pages.
 */
export default class Layout {

    constructor() {
        this.lateral_menu_open = prop(false);
    }

    _toggle_menu() {
        this.lateral_menu_open(!this.lateral_menu_open());
        return false;
    }

    /**
     * @param app {Application}: reference to the Application instance.
     * @param children
     */
    view({attrs: {app}, children}) {
        return [
            m('header', [
                // TODO: adjust img width and/or height
                m('a#brand-logo', { onclick: () => this._toggle_menu()},
                    m('span#hamburger-icon.glyphicon.glyphicon-menu-hamburger'),
                    m('img[height=30]', {src: loader('bajoo-logo.png')})
                ),

                // #user-menu
                m('#user-menu',
                    app.is_logged ? [
                        m('button.btn.btn-danger[type=button]', {onclick: () => app.reset()}, _('Log out'))
                    ] : ''
                ),

                LanguageMenu.make(),

                m('span#app-name', 'Bajoo web interface'),

                TaskListModal.make(app.task_manager),

                // modals
                TaskManagerStatus.make(app.task_manager),
                PassphraseInputModal.make(app.task_manager.passphrase_input)
            ]),

            LateralMenu.make(app.user, this.lateral_menu_open, () => app.reset()),

            m('#side-column',
                app.is_logged ? StorageNav.make(app.user) : ''
            ),
            m('main',
                app.is_logged === null ?
                    _('Connection ...') :
                    children
            ),
            m('footer', StaticLinksNav.make())
        ];
    }
}
