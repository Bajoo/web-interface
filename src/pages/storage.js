
import m from 'mithril';
import app from '../app';
import Storage from '../models/storage';


export default {

    oninit(vnode) {
        this.storage = null;

        Storage.get(app.session, vnode.attrs.id)
            .then(storage => this.storage = storage)
            .then(m.redraw);
    },

    view(vnode) {
        return m('.wall', [
            m('h1', this.storage ? this.storage.name : '???'),
            '...'
        ]);
    }
};
