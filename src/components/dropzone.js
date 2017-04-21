
import m from 'mithril';


/**
 * HTML tag which can receive files during an drag&drop operation.
 */
export default class Dropzone {
    constructor() {
        // If drag_enter > 0, the user drags a file over this dropzone.
        // We must keep track of the changes, because the browser send 'leave' events when entering on child elements.
        this.drag_enter = 0;
    }

    /**
     * @param tag {string}
     * @param callback {Function}
     * @param children
     */
    static make(tag, callback, children) {
        return m(Dropzone, {html_tag: tag, on_drop_file: callback}, children);
    }

    /**
     * @param [html_tag='']{string} 1st value passed to `m()`. If not set '' is used (producing a div).
     * @param on_drop_file {Function} called when a file is dropped. Receives the file in parameter.
     * @param children children's component
     */
    view({attrs: {html_tag = '', on_drop_file}, children}) {
        return m(html_tag, {
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
                if (evt.dataTransfer.types.indexOf('Files') > -1) {
                    evt.stopPropagation();
                    evt.preventDefault();
                    this.drag_enter--;
                }
            },
            ondrop: evt => {
                this.drag_enter = 0;
                if (evt.dataTransfer.files.length) {
                    evt.stopPropagation();
                    evt.preventDefault();

                    for (let f of evt.dataTransfer.files) {
                        on_drop_file(f);
                    }
                }
            }
        }, children);
    }
}
