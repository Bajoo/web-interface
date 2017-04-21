
import m from 'mithril';


/**
 * A flash message corresponding to the status.
 */
export default class StatusAlert {

    /**
     * @param status {Status}
     */
    static make(status) {return m(StatusAlert, {status});}

    /**
     * @param status {Status}
     */
    view({attrs: {status}}) {
        return status.type !== null ?
            m('.alert', {class: status.type === 'error' ? 'alert-danger' : ''}, status.message) :
            '';
    }
}
