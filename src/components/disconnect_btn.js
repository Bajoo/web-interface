import m from 'mithril';
import app from '../app';


export default {
    
    submit() {
        // TODO: understand why the setTimeout is necessary.
        setTimeout(() => app.reset(), 0);
    },
    
    view() {
        return m('button.btn.navbar-btn.btn-danger.navbar-right[type=button]', 
                 {onclick: this.submit },
                 'Log out');
    }
};
