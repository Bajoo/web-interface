
import m from 'mithril';
import Session from '../models/session';
import layout from '../layout';


export default {
    view(vnode) {
        return layout(m('', `Welcome ${vnode.attrs.user.email}!`));
    }
};
