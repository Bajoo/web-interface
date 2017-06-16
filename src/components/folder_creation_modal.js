
import m from 'mithril';
import Modal from './modal';
import {_} from '../utils/i18n';


export default class FolderCreationModal {
    constructor({attrs:{show_prop}}) {
        this.folder_name = '';
        this.show_prop = show_prop;
    }

    static make(file_selection) {
        return m(FolderCreationModal, {show_prop: file_selection.show_folder_creation_modal});
    }

    is_valid() {
        if (this.folder_name === '')
            return false;
        if (this.folder_name[0] === '/')
            return false;

        if (this.folder_name.split('/').some(part => part === '.' || part === '..'))
            return false;
        return true;
    }

    normalize() {
        return this.folder_name.split('/').filter(part => part).join('/');
    }

    view({attrs:{show_prop}}) {
        // TODO: display error (if !is_valid())
        return Modal.make(show_prop, _('Creation of a new folder'), 'folder-creation-modal', [
            m('form#folder-creation-form', {onsubmit: () => this._on_submit()}, m('.form-group', [
                m('label[for=folder-creation-input]', _('Name of the new folder:')),
                m('input#folder-creation-input.form-control', {onkeyup: evt => this.folder_name = evt.target.value})
            ])),
            m('p', _('Note: folders are not really created until a file is added into it.'))
        ], m('button[type=submit][form=folder-creation-form].btn.btn-default', {
            href: this.is_valid() ? `${m.route.get()}/${this.normalize()}` : null,
            class: this.is_valid() ? '' : 'disabled',
        }, _('Create')));
    }

    _on_submit() {
        if (this.is_valid()) {
            m.route.set(`${m.route.get()}/${this.normalize()}`);
            this.show_prop(false);
            return false;
        }
    }
}
