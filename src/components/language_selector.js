
import m from 'mithril';
import {get_lang, list_lang, set_lang} from '../utils/i18n';



/**
 * A Selectbox used to select the language
 */
export default class LanguageSelector {

    view() {
        let selected_lang = get_lang();

        return m('select.form-control', {onchange: evt => set_lang(evt.target.value)}, list_lang().map(
            ([code, lang]) => m('option', {value: code, selected: selected_lang === code}, lang))
        );
    }
}
