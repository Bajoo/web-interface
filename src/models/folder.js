
import app from '../app';
import {decrypt, encrypt} from '../encryption';


/**
 * Ask the passphrase until the user gives a valid passphrase (or cancel).
 *
 * @param passphrase_input
 * @param user_key
 * @return {Promise.<encryption.key} user key
 */
function decrypt_user_key(passphrase_input, user_key) {
    return passphrase_input.ask().then(passphrase => {
        let result = user_key.decrypt(passphrase);
        passphrase_input.set_feedback(result);

        if (!result)
            return decrypt_user_key(passphrase_input, user_key);
        return user_key;
    });
}


function blob2array_buffer(blob) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onerror = () => reject(reader.error);
        reader.onabort = () => reject(reader.error);
        reader.onloadend = () => resolve(reader.result);
        reader.readAsArrayBuffer(blob);
    });
}

export default class Folder {

    constructor(storage, {subdir}) {
        this.storage = storage;

        this.fullname = subdir.substr(0, subdir.length - 1);
        this.name = this.fullname.split('/').pop();
    }

    upload(passphrase_input, file) {
        console.log('upload ...');

        let p = null;

        if (this.storage.is_encrypted) {
            p = app.user.get_key()
                .then(user_key => user_key.primaryKey.isDecrypted ?
                    user_key :
                    decrypt_user_key(passphrase_input, user_key))
                .then(user_key => this.storage.get_key(user_key))
                .then(storage_key => blob2array_buffer(file)
                    .then(raw_file => encrypt(new Uint8Array(raw_file), storage_key))
                );
        } else {
            p = blob2array_buffer(file);
        }

        p.then(encrypted_file => {
            return this.storage.session.storage_request({
                url: `/storages/${this.storage.id}/${this.fullname}/${file.name}`,
                method: 'PUT',
                data: encrypted_file,
                serialize: x => x
            });
        })
            .then(() => console.log('UPLOAD encrypted file ok'), err => {
                if (err instanceof passphrase_input.constructor.UserCancelError)
                    return;
                console.log('Upload attempt failed:', err, err.stack);
            });
    }
}
