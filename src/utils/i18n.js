
import en from '../translations/en';
import fr from '../translations/fr';


// List of all languages translated
let translations = {
    en,
    fr
};

/**
 * Current lang setting. This value is either a key present in the translations object, or `null`.
 * By default, the navigator's language is used, it's possible.
 *
 * @type {?String}
 */
let lang = 'en';


export function set_lang(new_lang) {
    if (!new_lang)
        return false;
    if (new_lang in translations) {
        lang = new_lang;
        return true;
    }

    // Extract 2-digit lang code from full lang code: 'fr_FR' -> 'FR'
    new_lang = new_lang.replace(/(\w+)([-_]\w+)?/, '$1');
    if (new_lang in translations) {
        lang = new_lang;
        return true;
    }
    return false;
}


export function get_lang() {
    return lang;
}


// [['fr', 'Français'], ['en', 'English']]
export function list_lang() {
    return Object.keys(translations).map(lang => [lang, translations[lang]._lang]);
}


// Set default lang
set_lang(window.navigator.userLanguage || window.navigator.language);



function i18n_simple_quote(tristate_index, string) {
    if (lang in translations && string in translations[lang]) {
        let tr = translations[lang][string];
        if (Array.isArray(tr))
            tr = tr[tristate_index];
        return tr;
    } else {
        if (lang !== 'en')
            console.warn(`Missing "${lang}" translation: "${string}"`);
        return string;
    }
}


function i18n_template_literal(tristate_index, strings, ...values) {
    let i18n_key = strings.reduce((x, y, index) => {
        return `${x}{${index - 1}}${y}`;
    });

    if (!(lang in translations && i18n_key in translations[lang])) {
        if (lang !== 'en')
            console.warn(`Missing "${lang}" translation: "${i18n_key}"`);
        return String.raw(strings, ...values);
    }

    let i18n_template = translations[lang][i18n_key];
    if (Array.isArray(i18n_template))
        i18n_template = i18n_template[tristate_index];

    return i18n_template.replace(/{(\d)}/g, (_, index) => values[index]);
}

export function _(string) {
    return i18n_simple_quote(0, string);
}


export function _3(count, string) {
    return i18n_simple_quote(count < 2 ? 1 : 2, string);
}


export function _l(strings, ...values) {
    return i18n_template_literal(0, strings, ...values);
}


export function _3l(count) {
    return (...args) => i18n_template_literal(count < 2 ? 1 : 2, ...args);
}
