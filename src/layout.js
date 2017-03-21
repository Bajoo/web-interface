
import m from 'mithril';

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
        m('.container', content)
    ]);
}
