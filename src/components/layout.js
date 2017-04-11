
import m from 'mithril';
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
    view({attrs, children}) {
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
                            attrs.app.is_logged ? m(disconnect_btn) : ''
                        ])
                    ])
                ])
            ]),
            m('.container',
                attrs.app.is_logged === null ?
                    'Connexion ...' :
                    (
                        attrs.app.is_logged ? two_column_content(children) : children
                    )
            )
        ]);
    }
};
