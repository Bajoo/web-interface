
import m from 'mithril';
import app from './app';
import layout from './components/layout';


/**
 * Return a route resolver suitable for m.route, redirection to /login when the user has no session.
 */
export function logged_resolver(component) {
    return {
        onmatch() {
            if (!app.is_logged())
                m.route.set('/login');
            else
                return component;
        },

        render(vnode) {
            return m(layout, vnode);
        }

    };
}

/**
 * Special resolver for the login page.
 *
 * If the user already has a session, they are redirected to the home page.
 * @param component
 */
export function login_resolver(component) {
    return {
        onmatch() {
            if (app.is_logged())
                m.route.set('/');
            else
                return component;
        },

        render(vnode) {
            return m(layout, vnode);
        }
    };
}

