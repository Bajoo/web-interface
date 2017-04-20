
import m from 'mithril';


export default {
    /**
     * @param disconnect {() => undefined} callback called when the user click on the button.
     */
    view({attrs: {disconnect}}) {
        return m('button.btn.navbar-btn.btn-danger.navbar-right[type=button]',
            {onclick: () => disconnect() },
            'Log out');
    }
};
