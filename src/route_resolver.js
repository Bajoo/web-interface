
import m from 'mithril';
import app from './app';


/**
 * Return a route resolver suitable for m.route, redirection to /login when the user has no session.
 */
export function logged_resolver(component) {
    return {
        onmatch() {
            if (!app.session)
                m.route.set('/login');
            else
                return component;
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
            if (app.session)
                m.route.set('/');
            else
                return component;
        }
    };
}


