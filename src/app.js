
import m from 'mithril';


/**
 * Special singleton object
 *
 * All global reference are stored here. They can be set and used between pages.
 */
export default {
    session: null,
    user: null,
    
    reset() {
        this.session.disconnect();
        this.session = null;
        this.user = null;
        m.route.set('/login');
    },
    
    is_logged() {
        return !!(this.session && this.user);
    }
};
