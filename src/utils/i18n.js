
import fr from '../translations/fr';


// List of all languages translated
let translations = {
    fr
};

/**
 * Current lang setting. This value is either a key present in the translations object, or `null`.
 * By default, the navigator's language is used, it's possible.
 *
 * @type {?String}
 */
let lang = null;


export function set_lang(new_lang) {
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


// Set default lang
set_lang(window.navigator.userLanguage || window.navigator.language);



export default function _(strings, ...values) {
    if (!Array.isArray(strings)) { // Simple quote
        if (lang === null)
            return strings;

        if (lang in translations && strings in translations[lang])
            return translations[lang][strings];
        else {
            console.warn(`Missing "${lang}" translation: "${strings}"`);
            return strings;
        }
    }

    // ES6 literal quote
    if (lang === null)
        return String.raw(strings, ...values);


    let i18n_key = strings.reduce((x, y, index) => {
        return `${x}{${index - 1}}${y}`;
    });

    if (!(lang in translations && i18n_key in translations[lang])) {
        console.warn(`Missing "${lang}" translation: "${i18n_key}"`);
        return String.raw(strings, ...values);
    }

    let i18n_template = translations[lang][i18n_key];

    return i18n_template.replace(/{(\d)}/g, (_, index) => values[index]);
}
