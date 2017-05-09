
import m from 'mithril';
import app from '../app';
import _ from '../utils/i18n';
import StatusAlert from '../components/status_alert';
import TaskView from '../components/tasks_view';
import Status from '../view_models/status';


function create_storage_view() {
    return m('.media.storage-item', [
        m('i.media-left.media-middle', m('span.glyphicon.glyphicon-plus')),
        m('.media-body', [
            m('h4.media-heading',
                m('a.storage-name[href=/storage/new]', {oncreate: m.route.link}, _('New Share'))
            ),
            _('Create a new share')
        ])
    ]);
}


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
                    m('span.label.label-success', _('encrypted')) :
                    m('span.label.label-warning', _('not encrypted'))
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
        }, []).map(storage_couple => m('.row', storage_couple.map(
            storage => m('.col-md-6', storage_view(storage))
        )))
    );
}


export default {

    oninit() {
        this.status = new Status();

        app.user.onerror = err => {
            this.status.set_error(_`Unable to fetch the list of share: ${err.message || err}`);
            m.redraw();
        };
        app.user.load_storages().then(m.redraw);
    },

    onremove() {
        if (app.user) {
            app.user.onerror = null;
        }
    },

    view() {
        return m('', [
            m('.lead', _`Welcome ${app.user.email}!`),
            m('hr'),
            StatusAlert.make(this.status),
            TaskView.make(app.task_manager),
            app.user.storages ? [
                app.user.storages.my_bajoo ? storage_view(app.user.storages.my_bajoo) : '',
                m('h2', _('My shares')),
                create_storage_view(),
                m('hr'),
                storage_grid(app.user.storages.shares)
            ] : (app.user.error ? '' : _('Loading ...'))
        ]);
    }
};
