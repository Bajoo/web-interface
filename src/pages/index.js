
import m from 'mithril';
import Session from '../models/session';


export default {
    oninit(vnode) {
        console.log('INIT');
        console.log(args);
    },
    
    view(vnode) {
        return m('', `Welcome ${vnode.attrs.user.email}!`);
    }
};
