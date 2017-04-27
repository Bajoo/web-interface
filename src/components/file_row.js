
import m from 'mithril';
import {DownloadStatus} from '../models/download';
import human_readable_bytes from '../view_helpers/human_readable_bytes';
import relative_date from '../view_helpers/relative_date';

export default class FileRow {
    constructor() {
        /**
         * download action. If null, there is no ongoing download.
         * @type {?Download}
         */
        this.download = null;
    }

    /**
     * @param file {File}
     * @param status {Status}
     * @param passphrase_input {PassphraseInput}
     */
    static make(file, status, passphrase_input) {
        return m(FileRow, {file, status, passphrase_input, key: file.fullname});
    }

    view({attrs: {file, status, passphrase_input}}) {
        return m('tr', {key: file.fullname}, [
            m('td', m('i.glyphicon.glyphicon-file')),
            m('td', m('a[href=#]', {onclick: () => this._start_dl(file, status, passphrase_input)}, file.name)),
            m('td', human_readable_bytes(file.bytes)),
            m('td', relative_date(file.last_modified))
        ]);
    }


    _start_dl(file, status, passphrase_input) {
        this.download = file.download({passphrase_input});
        this.download.onstatuschange = st => {

            let status2msg = {
                [DownloadStatus.GET_USER_KEY]: 'Fetch user key ...',
                [DownloadStatus.WAIT_FOR_PASSPHRASE]: 'Wait for passphrase ...',
                [DownloadStatus.DECRYPT_FILE]: 'Decrypt file ...',
                [DownloadStatus.GET_STORAGE_KEY]: 'Fetch storage key ...',
                [DownloadStatus.DL_FILE]: 'Download file for server ...',
                [DownloadStatus.FINALIZE]: 'Finalize file ...',
                [DownloadStatus.DONE]: 'Done!'
            };
            switch (st) {
                case null:
                case DownloadStatus.ABORTED:
                    status.clear();
                    break;
                case DownloadStatus.DONE:
                    this.download = null;
                    status.set('success', `Download: ${status2msg[st]}`);
                    break;
                case DownloadStatus.ERROR:
                    let err = this.download.error;
                    if (err.xhr && err.xhr.status === 404) {
                        // TODO: 404 could be caused by user key or storage key.
                        status.set_error('Download: file not found');
                    } else
                        status.set_error(`Download failed: ${err.message || err}`);
                    break;
                default:
                    status.set('info', `Download: ${status2msg[st]}`);
            }
            m.redraw();
        };
        return false;
    }
}
