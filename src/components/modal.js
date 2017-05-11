
import m from 'mithril';


/**
 * Generic modal component
 *
 */
export default class Modal {

    /**
     * Make a generic modal
     *
     * @param {prop.<boolean>} show_prop property used to hide and show the modal.
     * @param {string} title string used as title
     * @param {string} title_id HTML ID of the modal title
     * @param body modal content. must be an object valid for mithril (vnode, string, array)
     * @param [footer] if set, content of the footer. must be an object valid for mithril (vnode, string, array)
     */
    static make(show_prop, title, title_id, body, footer = null) {
        return show_prop() ? m(Modal, {show_prop, title, title_id, body, footer}) : '';
    }

    view({attrs: {show_prop, title, title_id, body, footer}}) {
        return m('.modal[role=dialog]',
            {'aria-labelledby': title_id, class: show_prop() ? 'show' : ''},
            m('.modal-dialog[role=document]', m('.modal-content', [
                m('.modal-header', [
                    m('button.close[aria-label=Close]', {onclick: () => show_prop(false)},
                        m('span[aria-hidden=true]', m.trust('&times;'))
                    ),
                    m('h2.h4.modal-title#task-list-modal', {id: title_id}, title)
                ]),
                m('.modal-body', body),
                footer ? m('.modal-footer', footer) : ''
            ]))
        );
    }
}
