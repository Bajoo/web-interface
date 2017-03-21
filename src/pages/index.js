
import m from 'mithril';
import Session from '../models/session';
import app from '../app';
import layout from '../layout';


export default {
    view(vnode) {
        return layout(m('', `Welcome ${app.user.email}!`));
    }
};
