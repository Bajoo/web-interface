
import m from 'mithril';
import Dropzone from './dropzone';


export default class FolderRow {

    /**
     * @param folder {Folder}
     * @param passphrase_input {PassphraseInput}
     */
    static make(folder, passphrase_input) {
        return m(FolderRow, {folder, passphrase_input});
    }

    /**
     * @param folder {Folder}
     * @param passphrase_input {PassphraseInput}
     */
    view({attrs: {folder, passphrase_input}}) {
        return m(Dropzone, {
            html_tag: 'tr.folder-row',
            key: folder.fullname,
            on_drop_file: f => folder.upload(passphrase_input, f)
        }, [
            m('td', m('i.glyphicon.glyphicon-folder-open')),
            m('td', m('a', {oncreate: m.route.link, href: `${m.route.get()}/${folder.name}`}, folder.name)),
            m('td', '-'),
            m('td', '-')
        ]);
    }
}
