
// Entry point

import m from 'mithril';
import login from './pages/login';


console.log("OK");

m.route(document.body, '/login', {
    '/login': login
});
