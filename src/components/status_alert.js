
import m from 'mithril';


let status_alert = {
    view({attrs: {status}}) {
        return status.type !== null ?
            m('.alert', {class: status.type === 'error' ? 'alert-danger' : ''}, status.message) :
            '';
    }
};


/**
 * Display a flash message corresponding to the status.
 *
 * @param status {Status}
 */
export default (status) => m(status_alert, {status});
