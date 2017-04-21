
import m from 'mithril';
import app from '../app';
import FileList from '../components/file_list';
import PassphraseInputModal from '../components/passphrase_input_modal';
import StatusAlert from '../components/status_alert';
import Storage from '../models/storage';
import PassphraseInput from '../view_models/passphrase_input';
import Status from '../view_models/status';


function breadcrumb(storage, path) {
    let acc_path = `/storage/${storage.id}`;
    let folder_list = path.split('/').filter(f => f !== '');

    return m('ol.breadcrumb', [
        folder_list.length > 0 ?
            m('li', m('a', {oncreate: m.route.link, href: `/storage/${storage.id}`}, storage.name)) :
            m('li.active', storage.name),
        folder_list.map((folder, idx) => {
            acc_path = `${acc_path}/${folder}`;
            return (idx === (folder_list.length - 1)) ?
                m('li.active', folder) :
                m('li', m('a', {oncreate: m.route.link, href: acc_path}, folder));
        })
    ]);
}


export default {

    oninit(vnode) {
        this.storage = null;
        this.status = new Status();
        this.is_loading = true;

        this.passphrase_input = new PassphraseInput();

        // Load storage infos
        Storage.get(app.session, vnode.attrs.key)
            .then(storage => this.storage = storage)
            .then(() => this.is_loading = false)
            .then(m.redraw)
            .catch(err => {
                this.is_loading = false;
                console.error(`Error when fetching storage "${vnode.attrs.key}"`, err);
                if (err.code === 403)
                    this.status.set_error("You don't have the permission to see this storage.");
                else if (err.code === 404)
                    this.status.set_error('This storage does not exists');
                else
                    this.status.set_error(err.message || err.toString());
                m.redraw();
            });
    },

    view({attrs: {path = ''}}) {
        return m('.wall', [
            this.passphrase_input.enabled ? PassphraseInputModal.make(this.passphrase_input) : '',
            m('h1.h3', this.storage ? breadcrumb(this.storage, path) : this.is_loading ? '???' : ''),
            StatusAlert.make(this.status),
            (this.is_loading ? 'Loading ...' : ''),
            [ // Note: this Array is required to activate the mithril's special "key" behavior.
                this.storage ?
                    m(FileList, {storage: this.storage, key: path, passphrase_input: this.passphrase_input}) :
                    ''
            ]
        ]);
    }
};
