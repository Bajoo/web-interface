
import m from 'mithril';
import app from '../app';


function storage_link(storage) {
    return m('li', m('a', storage.name));
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
        return m('nav[style="border-right: 1px solid grey;"]', [
            m('h1.text-center', 'Bajoo storages'),
            m('ul.nav',
                this.my_bajoo ? storage_link(this.my_bajoo) : '',
                this.storages.length ? [
                    m('li', [
                        m('a', 'All shares'),
                        m('ul.nav[style="padding-left: 25px;"]',
                            this.storages.map(storage => storage_link(storage))
                        )
                    ])
                ] : ''
            )
        ]);
    }
};
