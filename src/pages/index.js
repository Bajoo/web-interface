
import m from 'mithril';
import app from '../app';
import {_, _l} from '../utils/i18n';
import StatusAlert from '../components/status_alert';
import Status from '../view_models/status';


function create_storage_view() {
    return m('.media.storage-item', [
        m('i.media-left.media-middle', m('span.glyphicon.glyphicon-plus')),
        m('.media-body', [
            m('h4.media-heading',
                m('a.storage-name[href=/storage/new]', {oncreate: m.route.link}, _('New share'))
            ),
            _('Create a new share')
        ])
    ]);
}


function storage_view(storage, allow_edit=false) {
    return m('.media.storage-item', [
        m('i.media-left.media-middle', m('span.glyphicon.glyphicon-folder-open')),
        m('.media-body', [
            m('h4.media-heading', [
                m('a.storage-name', {
                    href: `/storage/${storage.id}/browse`,
                    oncreate: m.route.link
                }, storage.name),
                ' ',
                m('span.storage-attributes', storage.is_encrypted ?
                    m('span.label.label-success', _('encrypted')) :
                    m('span.label.label-warning', _('not encrypted'))
                )
            ]),
            storage.description
        ]),
        m('.media-right.media-middle.storage-details', m('a.btn.btn-default', {
            href:  `/storage/${storage.id}/details`,
            oncreate: m.route.link
        }, [
            m('span.glyphicon.glyphicon-eye-open'),
            !allow_edit ? '' : ['/', m('span.glyphicon.glyphicon-pencil')]
        ]))
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
        }, []).map(storage_couple => m('.row', storage_couple.map(
            storage => m('.col-md-6', storage_view(storage, storage.rights.admin))
        )))
    );
}


export default {

    oninit() {
        this.status = new Status();

        app.user.storages.onerror = err => {
            this.status.set_error(_l`Unable to fetch the list of share: ${err.message || err}`);
            m.redraw();
        };
        app.user.load_storages().then(m.redraw);
    },

    onremove() {
        if (app.user) {
            app.user.storages.onerror = null;
        }
    },

    view() {
        return [
            m('.lead', _l`Welcome ${app.user.email}!`),
            m('hr'),
            StatusAlert.make(this.status),
            app.user.storages.dispatch(
                storages => [
                    storages.my_bajoo ? storage_view(storages.my_bajoo, false) : '',
                    m('h2', _('My shares')),
                    create_storage_view(),
                    m('hr'),
                    storage_grid(storages.shares)
                ],
                () => _('Loading ...')
            )
        ];
    }
};
