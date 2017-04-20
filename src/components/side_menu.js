
import m from 'mithril';


function storage_link(storage) {
    let href = `/storage/${storage.id}`;
    return m('li', {class: m.route.get().substr(0, href.length) == href ? 'active' : ''}, m('a',{
        href: href,
        oncreate: m.route.link,
    }, storage.name));
}


/**
 * Attributes:
 *  user {User} reference to the user connected.
 */
export default {

    oninit({attrs}) {
        this.storage_list = null;

        attrs.user.list_storages()
            .then(storage_list => this.storage_list = storage_list)
            .then(m.redraw);
    },

    view() {
        return m('nav.side-nav', [
            m('ul.nav',
                this.storage_list && this.storage_list.my_bajoo ? storage_link(this.storage_list.my_bajoo) : '',
                m('li', {class: m.route.get() === '/' ? 'active' : ''} ,[
                    m('a[href=/]', {oncreate: m.route.link}, 'All shares'),
                    this.storage_list ? m('ul.nav',
                        this.storage_list.shares.map(storage => storage_link(storage))
                    ) : '...'
                ])
            )
        ]);
    }
};
