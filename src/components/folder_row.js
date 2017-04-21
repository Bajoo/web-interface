
import m from 'mithril';
import Dropzone from './dropzone';


export default class FolderRow {

    /**
     * @param folder {Folder}
     * @param passphrase_input {PassphraseInput}
     */
    static make(folder, passphrase_input) {
        return m(FolderRow, {folder, passphrase_input, key: folder.fullname});
    }

    /**
     * @param folder {Folder}
     * @param passphrase_input {PassphraseInput}
     */
    view({attrs: {folder, passphrase_input}}) {
        return Dropzone.make('tr.folder-row', f => folder.upload(passphrase_input, f), [
            m('td', m('i.glyphicon.glyphicon-folder-open')),
            m('td', m('a', {oncreate: m.route.link, href: `${m.route.get()}/${folder.name}`}, folder.name)),
            m('td', '-'),
            m('td', '-')
        ]);
    }
}
