
import m from 'mithril';


/**
 * Attributes
 *  folder {Folder}
 *  passphrase_input {PassphraseInput}
 */
export default {

    oninit() {
        this.drag_enter = 0;
        this.drag_over = false;
    },

    view({attrs}) {
        console.log('redraw');
        return m('tr.folder-row', {
            key: attrs.folder.name,
            class: this.drag_enter > 0 ? 'dropzone' : '',
            ondragover: evt => {
                evt.redraw = false;
                if (evt.dataTransfer.types.indexOf('Files') > -1) {
                    evt.stopPropagation();
                    evt.preventDefault();
                }
            },
            ondragenter: evt => {
                if (evt.dataTransfer.types.indexOf('Files') > -1) {
                    evt.stopPropagation();
                    evt.preventDefault();
                    this.drag_enter++;
                }

                if (this.drag_enter !== 1)
                    evt.redraw = false;
            },
            ondragleave: evt => {
                if (this.drag_enter !== 1)
                    evt.redraw = false;
                if (evt.dataTransfer.types.indexOf('Files') > -1)
                    this.drag_enter--;
            },
            ondrop: evt => {
                this.drag_enter = 0;
                if (evt.dataTransfer.files.length) {
                    evt.stopPropagation();
                    evt.preventDefault();

                    for (let f of evt.dataTransfer.files) {
                        console.log('Received file: ', f.name);
                        attrs.folder.upload(attrs.passphrase_input, f);
                    }
                }
            }

        }, [
            m('td', m('i.glyphicon.glyphicon-folder-open')),
            m('td', m('a', {oncreate: m.route.link, href: `${m.route.get()}/${attrs.folder.name}`}, attrs.folder.name)),
            m('td', '-'),
            m('td', '-')
        ]);
    }
};
