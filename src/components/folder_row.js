
import m from 'mithril';
import dropzone from './dropzone';


export default {
    /**
     * @param folder {Folder}
     * @param passphrase_input {PassphraseInput}
     */
    view({attrs: {folder, passphrase_input}}) {
        return m(dropzone, {
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
};
