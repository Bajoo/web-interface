
// Entry point

import m from 'mithril';
import {logged_resolver, login_resolver} from './route_resolver';
import login from './pages/login';
import index from './pages/index';
import storage from './pages/storage';


// Workaround for bug https://github.com/lhorie/mithril.js/issues/1691
let mrequest = m.request;
m.request = options => new Promise(function(resolve, reject) {
    mrequest(Object.assign({}, options, {config: xhr => {xhr.onerror = reject;}})).then(resolve, reject);
});


// Warning: no trailing slash, or else it'll fail silently.
m.route(document.body, '/', {
    '/': logged_resolver((index)),
    '/login': login_resolver((login)),
    // "key" is a special parameter name, forcing rebuild of the component.
    '/storage/:key': logged_resolver((storage)),
    '/storage/:key/:path...': logged_resolver((storage))
});
