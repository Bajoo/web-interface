
import m from 'mithril';
import Session from '../models/session';
import app from '../app';


export default {
    view(vnode) {
        return m('', `Welcome ${app.user.email}!`);
    }
};
