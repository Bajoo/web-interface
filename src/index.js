
// Entry point

import m from 'mithril';
import {logged_resolver, login_resolver} from './route_resolver';
import Session from './models/session';
import User from './models/user';
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


function set_route() {

    // Warning: no trailing slash, or else it'll fail silently.
    m.route(document.body, '/', {
        '/': logged_resolver((index)),
        '/login': login_resolver((login)),
        // "key" is a special parameter name, forcing rebuild of the component.
        '/storage/:key': logged_resolver((storage)),
        '/storage/:key/:path...': logged_resolver((storage))
    });
}


let p = Session.from_cookies().then(session => {
    app.session = session;
    return User.from_session(session);
}).then(user => app.user = user).then(set_route, set_route);
