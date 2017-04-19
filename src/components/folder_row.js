
import m from 'mithril';
import dropzone from './dropzone';


/**
 * Attributes
 *  folder {Folder}
 *  passphrase_input {PassphraseInput}
 */
export default {
    view({attrs}) {
        return m(dropzone, {
            html_tag: 'tr.folder-row',
            key: attrs.folder.fullname,
            on_drop_file: f => attrs.folder.upload(attrs.passphrase_input, f)
        }, [
            m('td', m('i.glyphicon.glyphicon-folder-open')),
            m('td', m('a', {oncreate: m.route.link, href: `${m.route.get()}/${attrs.folder.name}`}, attrs.folder.name)),
            m('td', '-'),
            m('td', '-')
        ]);
    }
};
