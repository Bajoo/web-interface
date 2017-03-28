import m from 'mithril';
import app from '../app';


export default {
    
    submit() {
        // TODO: revoke token for a real disconnection.
        // TODO: understand why the setTimeout is necessary.
        setTimeout(() => {
            app.session = null;
            app.user = null;
            m.route.set('/login');
        }, 0);
    },
    
    view() {
        return m('button.btn.navbar-btn.btn-danger.navbar-right[type=button]', 
                 {onclick: this.submit },
                 'Log out');
    }
};
