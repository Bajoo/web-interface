
import m from 'mithril';


/**
 * Attributes:
 *  disconnect {() => undefined} callback called when the user click on the button.
 */
export default {
    view({attrs}) {
        return m('button.btn.navbar-btn.btn-danger.navbar-right[type=button]', 
                 {onclick: () => attrs.disconnect() },
                 'Log out');
    }
};
