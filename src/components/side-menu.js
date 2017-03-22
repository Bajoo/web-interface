
import m from 'mithril';
import app from '../app';


function storage_link(storage) {
    return m('li', m('a',{
        href: `/storage/${storage.id}`,
        oncreate: m.route.link
    }, storage.name));
}

export default {

    oninit() {

        this.my_bajoo = null;
        this.storages = [];

        app.user.list_storages(app.session)
            .then(storages => {
                let idx = storages.findIndex(s => s.name === 'MyBajoo');
                if (idx !== -1) {
                    this.my_bajoo = storages[idx];
                    storages.splice(idx, 1);
                }
                this.storages = storages.sort(s => s.name);
            })
            .then(m.redraw);
    },

    view() {
        return m('nav.side-nav', [
            m('h1.text-center', 'Bajoo storages'),
            m('ul.nav',
                this.my_bajoo ? storage_link(this.my_bajoo) : '',
                this.storages.length ? [
                    m('li', [
                        m('a[href=/]', {oncreate: m.route.link}, 'All shares'),
                        m('ul.nav',
                            this.storages.map(storage => storage_link(storage))
                        )
                    ])
                ] : ''
            )
        ]);
    }
};
