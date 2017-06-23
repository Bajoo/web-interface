
import m from 'mithril';
import {_} from '../utils/i18n';


export default class DisconnectButton {

    /**
     * Mithril view constructor.
     *
     * @param {function()} disconnect_cb - callback executed when the button is activated.
     */
    static make(disconnect_cb) {return m(DisconnectButton, {disconnect_cb});}

    /**
     * @param {function()} disconnect_cb - callback executed when the button is activated.
     */
    view({attrs: {disconnect_cb}}) {
        return m('button.btn.navbar-btn.btn-danger.navbar-right[type=button]',
            {onclick: () => disconnect_cb()},
            _('Log out'));
    }
}
