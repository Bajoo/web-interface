
import m from 'mithril';


/**
 * HTML tag which can receive files during an drag&drop operation.
 *
 * Attributes
 *  html_tag (1st value passed to `m()`. If not set '' is used (producing a div).
 *  on_drop_file {Function} called when a file is droped. Receives the file in parameter.
 */
export default {
    oninit() {
        // If drag_enter > 0, the user drags a file over this dropzone.
        // We must keep track of the changes, because the browser send 'leave' events when entering on child elements.
        this.drag_enter = 0;
    },

    view({attrs, children}) {
        return m(attrs.html_tag || '', {
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
                        attrs.on_drop_file(f);
                    }
                }
            }
        }, children);
    }
};
