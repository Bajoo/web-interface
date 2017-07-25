
import m from 'mithril';
import {_} from '../utils/i18n';
import DisconnectButton from './disconnect_button';
import SideMenu from './side_menu';


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
                m('span.center', user.email),
                m('hr'),

                // TODO: don't use it directly: use only inner elements
                m(SideMenu, {user}),

                m('hr'),
                DisconnectButton.make(disconnect_cb)
            ] : m('ul.nav', [
                m('li', m('a[ref=/login]', {oncreate: m.route.link}, _('Login'))),
                m('li', m('a[href=/register]', {oncreate: m.route.link}, _('Register')))
            ]),

            m('hr'),

            // footer links
            m('ul.nav', [
                m('li', m('a', {href: _('https://www.bajoo.fr')}, _('Website'))),
                m('li', m('a', {href: _('https://drop.bajoo.fr')}, _('Bajoo Drop'))),
                m('li', m('a', {href: _('https://www.bajoo.fr/en/contact-us')}, _('Contact'))),
                m('li', m('a', {href: _('https://www.bajoo.fr/en/help')}, _('Help'))),
            ])
        ]);
    }
}
