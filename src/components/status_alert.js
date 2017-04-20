
import m from 'mithril';


/**
 * A flash message corresponding to the status.
 */
export default {
    /**
     * @param status {Status}
     */
    view({attrs: {status}}) {
        return status.type !== null ?
            m('.alert', {class: status.type === 'error' ? 'alert-danger' : ''}, status.message) :
            '';
    }
};
