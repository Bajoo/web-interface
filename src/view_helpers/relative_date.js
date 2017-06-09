
import {_, _3l} from '../utils/i18n';


// duration in ms
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;


/**
 * Display a date in a relative way.
 */
export default function relative_date(date) {
    let diff = Date.now() - date.getTime();
    
    let text = '';
    switch (true) {
        case Math.round(diff / SECOND) < 1:
            text = _('just now');
            break;
        case Math.round(diff / SECOND) < 60:
            let nb_seconds = Math.round(diff / SECOND);
            text = _3l(nb_seconds)`${nb_seconds} second(s) ago`;
            break;
        case Math.round(diff / MINUTE) < 60:
            let nb_minutes = Math.round(diff / MINUTE);
            text = _3l(nb_minutes)`${nb_minutes} minute(s) ago`;
            break;
        case Math.round(diff / HOUR) < 24:
            let nb_hours = Math.round(diff / HOUR);
            text = _3l(nb_hours)`${nb_hours} hour(s) ago`;
            break;
        case Math.round(diff / DAY) < 30:
            let nb_days = Math.round(diff / DAY);
            text = _3l(nb_days)`${nb_days} day(s) ago`;
            break;
        default:
            text = date.toLocaleString();
    }
    return text;
}
