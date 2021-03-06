
// Entry point

import m from 'mithril';
import {logged_resolver, login_resolver} from './route_resolver';
import activation from './pages/activation';
import gen_key from './pages/gen_key';
import login from './pages/login';
import register from './pages/register';
import index from './pages/index';
import storage from './pages/storage';
import new_storage from './pages/new_storage';
import DetailsPage from './pages/details_storage';
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
    '/': logged_resolver(index),
    '/gen_key': logged_resolver(gen_key),
    '/login': login_resolver(login),
    '/activation': login_resolver(activation),
    '/register': login_resolver(register),
    // "key" is a special parameter name, forcing rebuild of the component.
    '/storage/new': logged_resolver(new_storage),
    '/storage/:key/details': logged_resolver(DetailsPage),
    '/storage/:key/browse': logged_resolver(storage),
    '/storage/:key/browse/:path...': logged_resolver(storage)
});


// force page reload to trigger the route resolver
function reload_route() {
    // Note: m.route.get() can be undefined if this request resolves before the first draw.
    if (m.route.get() !== undefined)
        m.route.set(m.route.get());
    else
        setTimeout(() => {
            let r = m.route.get();
            if (r)
                m.route.set(m.route.get());
        }, 0);
}

app.log_from_cookie().then(reload_route, err => {
    reload_route();
    console.log('Log from refresh_token (from a cookie) failed: ', err);
});
