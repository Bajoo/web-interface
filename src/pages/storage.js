
import m from 'mithril';
import app from '../app';
import file_list from '../components/file_list';
import passphrase_input_modal from '../components/passphrase_input_modal';
import Storage from '../models/storage';
import PassphraseInput from '../viewmodels/passphrase_input';


function breadcrumb(storage, path) {
    let acc_path = `/storage/${storage.id}`;
    let folder_list = path.split('/').filter(f => f !== '');

    return m('ol.breadcrumb', [
        folder_list.length > 0 ?
            m('li', m('a', {oncreate: m.route.link, href: `/storage/${storage.id}`}, storage.name)) :
            m('li.active', storage.name),
        folder_list.map((folder, idx) => {
            acc_path = `${acc_path}/${folder}`;
            return (idx == folder_list.length - 1) ?
                m('li.active', folder) :
                m('li', m('a', {oncreate: m.route.link, href: acc_path}, folder));
        })
    ]);
}


export default {

    oninit(vnode) {
        this.storage = null;

        this.passphrase_input = new PassphraseInput();

        // Load storage infos
        let p = Storage.get(app.session, vnode.attrs.key)
            .then(storage => this.storage = storage)
            .then(m.redraw)
            .catch(err => console.log(err));
    },

    view(vnode) {
        return m('.wall', [
            this.passphrase_input.enabled ? m(passphrase_input_modal, {model: this.passphrase_input}) : '',
            m('h1.h3', this.storage ? breadcrumb(this.storage, vnode.attrs.path || '') : '???'),
            [this.storage ? m(file_list, {storage: this.storage, key: vnode.attrs.path, passphrase_input: this.passphrase_input}) : 'Loading ...'
            ]
        ]);
    }
};
