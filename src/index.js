
// Entry point

import m from 'mithril';
import login from './pages/login';
import index from './pages/index';


m.route(document.body, '/login', {
    '/': index,
    '/login': login,
});
