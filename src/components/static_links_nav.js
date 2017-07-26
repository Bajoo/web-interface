
import m from 'mithril';
import {_} from '../utils/i18n';


/**
 * A <nav> tag containing all links to static page
 */
export default class StaticLinksNav {

    /**
     * @param {boolean} [vertical=false] - if true, display the list vertically instead of horizontally.
     */
    static make(vertical=false) {
        return m(this, {vertical});
    }

    view({attrs: {vertical}}) {
        let links = [
            ['Website', 'https://www.bajoo.fr'],
            ['Bajoo Drop', 'https://drop.bajoo.fr'],
            ['Contact', 'https://www.bajoo.fr/en/contact-us'],
            ['Help', 'https://www.bajoo.fr/en/help']
        ];

        return m('nav', m('ul.menu',
            { class: vertical ? '' : 'horizontal'},
            links.map(
                link => m('li.menu-item', m('a', {href: _(link[1])}, _(link[0])))
            )
        ));
    }
}
