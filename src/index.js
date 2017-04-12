
// Entry point

import m from 'mithril';
import {logged_resolver, login_resolver} from './route_resolver';
import login from './pages/login';
import index from './pages/index';
import storage from './pages/storage';
import app from './app';


// Workaround for bug https://github.com/lhorie/mithril.js/issues/1691
let mrequest = m.request;
m.request = options => new Promise(function(resolve, reject) {
    mrequest(Object.assign({}, options, {
        config: (xhr, args) => {
            xhr.onerror = reject;
            return 'config' in options ? options.config(xhr, args) : xhr;
        }})).then(resolve, reject);
});


// Warning: no trailing slash, or else it'll fail silently.
m.route(document.body, '/', {
    '/': logged_resolver((index)),
    '/login': login_resolver((login)),
    // "key" is a special parameter name, forcing rebuild of the component.
    '/storage/:key': logged_resolver((storage)),
    '/storage/:key/:path...': logged_resolver((storage))
});


// force page reload to trigger the route resolver
function reload_route() {
    // Note: m.route.get() can be undefined if this request resolves before the first draw.
    if (m.route.get() !== undefined)
        m.route.set(m.route.get());
}

app.log_from_cookie().then(reload_route, err => {
    reload_route();
    console.log('Log from refresh_token (from a cookie) failed: ', err);
});
