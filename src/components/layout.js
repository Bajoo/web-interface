
import m from 'mithril';
import app from '../app';
import side_menu from './side-menu';
import disconnect_btn from './disconnect_btn.js';


function two_column_content(content) {
    return m('div.row', [
        m('.col-md-2[role="nav"]', m(side_menu)),
        m('.col-md-10[role="main"]', content)
    ]);
}

/**
 * Return a mithril component wrapping its children around a layout common to all pages.
 */
export default {
    view(vnode) {
        return m('', [
            m('header', [
                m('nav.navbar.navbar-default', [
                    m('.container-fluid', [
                        m('.navbar-header',
                            // TODO: navbar-brand declares a forced, hard-coded height value.
                            // Custom CSS should be added.
                            m('a.navbar-brand[href=#]',
                                m('img[src=static/bajoo-logo.png][width=100]')
                            )
                        ),
                        m('.navbar-collapse', [
                            m('p.navbar-text', 'Bajoo web interface'),
                            app.session ? m(disconnect_btn) : ''
                        ])
                    ])
                ])
            ]),
            m('.container',
                app.session ? two_column_content(vnode.children) : vnode.children
            )
        ]);
    }
};
