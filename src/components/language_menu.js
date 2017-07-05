
import m from 'mithril';
import {list_lang, set_lang} from '../utils/i18n';
import loader from '../utils/loader';


function _flag(code, lang) {
    return m('a[href=#]', {onclick: _ => (set_lang(code), false)},
        m('img', {src: loader(`flags/${code}.png`), alt: lang})
    );
}

export default class LanguageMenu {

    static make() {
        return m(LanguageMenu);
    }

    view() {
        return m('#lang-selection.navbar-text.navbar-right', list_lang().reduce(
            (result, [code, lang], index, array) => {
                result.push(_flag(code, lang));
                if (index < array.length - 1)
                    result.push(' | ');
                return result;
            }, [])
        );
    }
}
