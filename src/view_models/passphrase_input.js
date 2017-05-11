
import m from 'mithril';
import {_} from '../utils/i18n';
import prop from '../utils/prop';


/**
 * ViewModel of the passphrase input modal.
 */
export default class PassphraseInput {
    constructor() {
        this.enabled = false;
        this.passphrase = prop('');
        this.wait_for_feedback = false;
        this.error = false;

        this._resolve = null;
        this._reject = null;
    }


    /**
     * Ask for the user to type its passphrase.
     *
     * @return {Promise<string>} Resolved when the user enters a passphrase. if the user refuse to respond, the promise
     *  is rejected.
     */
    ask() {
        return new Promise((resolve, reject) => {
            this.enabled = true;
            this._resolve = resolve;
            this._reject = reject;
            m.redraw();
        });
    }

    /**
     * Set a feedback about the passphrase returned by `ask()`
     *
     * @param success {boolean}: `true` if the passphrase is valid; `false` otherwise.
     */
    set_feedback(success) {
        this.wait_for_feedback = false;
        this.passphrase(''); // Never keep the passphrase when not needed.
        if (success)
            this.enabled = false;
        else
            this.error = true;
        m.redraw();
    }

    cancel() {
        this.enabled = false;
        this.passphrase('');
        this._reject(new this.constructor.UserCancelError());
    }

    submit() {
        this._resolve(this.passphrase());
    }

    /**
     * Ask the passphrase until the user gives a valid passphrase (or cancel).
     *
     * @param {encryption.key} key
     * @return {Promise.<encryption.key>} user key. If the user cancel, the promise is rejected by an `UserCancelError`.
     */
    decrypt_key(key) {
        return this.ask().then(passphrase => {
            let result = key.decrypt(passphrase);
            this.set_feedback(result);

            return result ? key : this.decrypt_key(key);
        });
    }
}

PassphraseInput.UserCancelError = class UserCancelError extends Error {
    constructor() {
        super();
        this.name = this.constructor.name;
        this.message = _('The user refused to enter the passphrase');
    }
};
