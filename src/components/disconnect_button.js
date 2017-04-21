
import m from 'mithril';


export default class DisconnectButton {

    /**
     * @param callback {Function}
     */
    static make(callback) {return m(DisconnectButton, {disconnect: callback});}

    /**
     * @param disconnect {() => undefined} callback called when the user click on the button.
     */
    view({attrs: {disconnect}}) {
        return m('button.btn.navbar-btn.btn-danger.navbar-right[type=button]',
            {onclick: () => disconnect() },
            'Log out');
    }
}
