
import m from 'mithril';
import {_} from '../utils/i18n';


function storage_link(storage) {
    let href = `/storage/${storage.id}/browse`;
    return m('li', {class: m.route.get().substr(0, href.length) === href ? 'active' : ''}, m('a',{
        href: href,
        oncreate: m.route.link,
    }, storage.name));
}


export default class SideMenu {
    /**
     * @param user {User} reference to the user connected.
     */
    oninit({attrs: {user}}) {
        user.load_storages().then(m.redraw);
    }

    /**
     * @param user {User} reference to the user connected.
     */
    view({attrs: {user}}) {
        return m('nav#side-menu.side-nav', [
            m('ul.nav',
                user.storages && user.storages.my_bajoo ? storage_link(user.storages.my_bajoo) : '',
                m('li', {class: m.route.get() === '/' ? 'active' : ''}, [
                    m('a[href=/]', {oncreate: m.route.link}, _('All shares')),
                    user.storages ? m('ul.nav', user.storages.shares.map(storage_link)) :
                        user.error ? m('.side-block.bg-danger', _('Loading error')) : '...'
                ])
            )
        ]);
    }
}
