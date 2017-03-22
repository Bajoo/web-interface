
import m from 'mithril';
import app from './app';
import side_menu from './components/side-menu';


function two_column_content(content) {
    return m('row', [
        m('.col-md-2[role="nav"]', m(side_menu)),
        m('.col-md-10[role="main"]', content)
    ]);
}


/**
 * Return a mithril vnode wrapping the content (passed in parameter) around a layout common to all pages.
 */
export default function layout(content) {
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
                    m('p.navbar-text', 'Bajoo web interface')
                ])
            ])
        ]),
        m('.container',
            app.session ? two_column_content(content) : content
        )
    ]);
}
