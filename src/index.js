
// Entry point

import m from 'mithril';
import login from './pages/login';
import index from './pages/index';


// Workaround for bug https://github.com/lhorie/mithril.js/issues/1691
let mrequest = m.request;
m.request = options => new Promise(function(resolve, reject) {
    mrequest(Object.assign({}, options, {config: xhr => {xhr.onerror = reject}})).then(resolve, reject);
});


m.route(document.body, '/login', {
    '/': index,
    '/login': login
});
