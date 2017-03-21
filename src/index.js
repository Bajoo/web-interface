
// Entry point

import m from 'mithril';
import {logged_resolver, login_resolver} from './route_resolver';
import login from './pages/login';
import index from './pages/index';


// Workaround for bug https://github.com/lhorie/mithril.js/issues/1691
let mrequest = m.request;
m.request = options => new Promise(function(resolve, reject) {
    mrequest(Object.assign({}, options, {config: xhr => {xhr.onerror = reject;}})).then(resolve, reject);
});


m.route(document.body, '/', {
    '/': logged_resolver(index),
    '/login': login_resolver(login)
});
