
import m from 'mithril';
import {_} from '../utils/i18n';


export default class Footer {
    static make() {
        return m(Footer);
    }

    view() {
        return m('footer', [
            m('a', {href: _('https://www.bajoo.fr')}, _('Website')),
            m('a', {href: _('https://drop.bajoo.fr')}, _('Bajoo Drop')),
            m('a', {href: _('https://www.bajoo.fr/en/contact-us')}, _('Contact')),
            m('a', {href: _('https://www.bajoo.fr/en/help')}, _('Help')),
        ]);
    }
}
