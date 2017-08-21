
import m from 'mithril';
import {_} from '../utils/i18n';
import LanguageSelector from './language_selector';
import StorageNav from './storage_nav';
import StaticLinksNav from './static_links_nav';


export default class LateralMenu {

    /**
     * @param {User} user
     * @param {Prop} is_open
     * @param {function} disconnect_cb
     */
    static make(user, is_open, disconnect_cb) {
        return m(LateralMenu, {user, is_open, disconnect_cb});
    }

    view({attrs: {user, is_open, disconnect_cb}}) {
        return m('#lateral-menu', {class: is_open() ? 'menu-open' : ''}, [

            m('a.close[href=#]', {onclick: () => is_open(false)}, m.trust('&times;')),

            user ? [
                m('span.menu-item', user.email),
                m('hr'),
                m(LanguageSelector),
                m('hr'),

                StorageNav.make(user),
                m('hr'),

                m('ul.menu', [
                    m('li.menu-item',
                        m('a[href=#]', {onclick: disconnect_cb}, _('Log out'))
                    )
                ])
            ] : m('ul.menu', [
                m('li.menu-item', m('a[ref=/login]', {oncreate: m.route.link}, _('Login'))),
                m('li.menu-item', m('a[href=/register]', {oncreate: m.route.link}, _('Register')))
            ]),

            m('hr'),
            StaticLinksNav.make(true)
        ]);
    }
}
