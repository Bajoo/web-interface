
import m from 'mithril';
import app from './app';
import layout from './components/layout';


/**
 * Return a route resolver suitable for m.route, redirection to /login when the user has no session.
 */
export function logged_resolver(component) {
    return {
        onmatch(_, requested_path) {
            if (app.is_logged === false) {
                app.redirect_to = requested_path;
                m.route.set('/login');
                return;
            }
            app.redirect_to = null;

            if (app.is_logged === null || requested_path === '/gen_key')
                return component;

            //preload user key.
            return app.user.get_key().then(_ => component, err => {
                if ('xhr' in err && err.xhr.status === 404) {
                    // Redirect to the user key generation.
                    app.redirect_to = requested_path;
                    m.route.set('/gen_key');
                    return;
                }
                console.error('During user key prefetch:', err);
                // TODO: we should redirect to a dedicated error page.
                return component;
            });
        },

        render(vnode) {
            // During the log phase, the route can change between 'onmatch' and 'render' calls.
            if (app.is_logged === false) return '';

            return m(layout, {app: app}, vnode);
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
            if (app.is_logged === true)
                m.route.set('/');
            else
                return component;
        },

        render(vnode) {
            return m(layout, {app: app}, vnode);
        }
    };
}

