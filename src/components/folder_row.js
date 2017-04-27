
import m from 'mithril';
import Dropzone from './dropzone';
import {UploadStatus} from '../models/upload';


export default class FolderRow {
    constructor() {
        this.upload = null;
    }

    /**
     * @param folder {Folder}
     * @param status {Status}
     * @param passphrase_input {PassphraseInput}
     */
    static make(folder, status, passphrase_input) {
        return m(FolderRow, {folder, status, passphrase_input, key: folder.fullname});
    }

    /**
     * @param folder {Folder}
     * @param status {Status}
     * @param passphrase_input {PassphraseInput}
     */
    view({attrs: {folder, status, passphrase_input}}) {
        return Dropzone.make('tr.folder-row', f => this._start_upload(folder, f, status, passphrase_input), [
            m('td', m('i.glyphicon.glyphicon-folder-open')),
            m('td', m('a', {oncreate: m.route.link, href: `${m.route.get()}/${folder.name}`}, folder.name)),
            m('td', '-'),
            m('td', '-')
        ]);
    }

    _start_upload(folder, file, status, passphrase_input) {
        this.upload = folder.upload(file);
        this.upload.onstatuschange = st => {
            let status2msg = {
                [UploadStatus.GET_USER_KEY]: 'Fetch user key ...',
                [UploadStatus.WAIT_FOR_PASSPHRASE]: 'Wait for passphrase ...',
                [UploadStatus.PREPARE_FILE]: 'Read file content ...',
                [UploadStatus.ENCRYPT_FILE]: 'Encrypt file ...',
                [UploadStatus.GET_STORAGE_KEY]: 'Fetch storage key ...',
                [UploadStatus.UPLOAD_FILE]: 'Upload file to server ...',
                [UploadStatus.DONE]: 'Done!'
            };
            switch (st) {
                case null:
                case UploadStatus.ABORTED:
                    this.upload = null;
                    status.clear();
                    break;
                case UploadStatus.DONE:
                    this.upload = null;
                    status.set('success', `Upload: ${status2msg[st]}`);
                    break;
                case UploadStatus.ERROR:
                    let err = this.upload.error;
                    status.set_error(`Upload failed: ${err.message || err}`);
                    break;
                default:
                    status.set('info', `Upload: ${status2msg[st]}`);
            }
            m.redraw();
        };
        this.upload.start(passphrase_input);
    }
}
