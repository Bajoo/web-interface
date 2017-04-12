
import m from 'mithril';
import app from '../app';


function storage_view(storage) {
    return m('.media.storage-item', [
        m('i.media-left.media-middle', m('span.glyphicon.glyphicon-folder-open')),
        m('.media-body', [
            m('h4.media-heading', [
                m('a.storage-name', {
                    href: `/storage/${storage.id}`,
                    oncreate: m.route.link
                }, storage.name),
                ' ',
                m('span.storage-attributes', storage.is_encrypted ?
                    m('span.label.label-success', 'encrypted') :
                    m('span.label.label-warning', 'not encrypted')
                )
            ]),
            storage.description
        ])
    ]);
}

/**
 * Display storages in a two-column grid.
 *
 * @param storage_list {Storage[]}
 */
function storage_grid(storage_list) {
    return m('.container-fluid',
        storage_list.reduce((acc, storage, index) => {
            //group storage 2 by 2
            if (index % 2)
                acc[acc.length - 1].push(storage);
            else
                acc.push([storage]);
            return acc; // [[stor1, stor2], [stor3, stor4], ...]
        }, []).map(storage_couple => m('row', storage_couple.map(
            storage => m('.col-md-6', storage_view(storage))
        )))
    );
}


export default {

    oninit() {
        this.storage_list = null;

        app.user.list_storages()
            .then(storage_list => this.storage_list = storage_list)
            .then(m.redraw);
    },

    view() {
        return m('', [
            m('.lead', `Welcome ${app.user.email}!`),
            m('hr'),
            this.storage_list ? [
                this.storage_list.my_bajoo ? storage_view(this.storage_list.my_bajoo) : '',
                m('h2', 'My shares'),
                storage_grid(this.storage_list.shares)
            ] : 'Loading ...'
        ]);
    }
};
