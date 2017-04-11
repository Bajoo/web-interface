
import m from 'mithril';

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
        case Math.round(diff / SECOND) < 60:
            text = `${Math.round(diff / MINUTE)} second ago`;
            break;
        case Math.round(diff / MINUTE) < 2:
            text = 'a minute ago';
            break;
        case Math.round(diff / MINUTE) < 60:
            text = `${Math.round(diff / MINUTE)} minutes ago`;
            break;
        case Math.round(diff / HOUR) < 2:
            text = 'a hour ago';
            break;
        case Math.round(diff / HOUR) < 24:
            text = `${Math.round(diff / HOUR)} hours ago`;
            break;
        case Math.round(diff / DAY) < 1:
            text = 'a day ago';
            break;
        case Math.round(diff / DAY) < 30:
            text = `${Math.round(diff / DAY)} days ago`;
            break;
        default:
            text = date.toLocaleString();
    }
    return text;
}
