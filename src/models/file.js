
import app from '../app';
import {decrypt} from '../encryption';


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


export default class File {

    constructor(storage, {name, hash, last_modified, bytes}) {
        this.storage = storage;

        this.fullname = name;
        this.name = name.split('/').pop();
        this.hash = hash;
        this.bytes = bytes;
        this.last_modified = new Date(last_modified);
    }

    download({passphrase_input}) {
        console.log('download ...');

        let p = null;

        if (this.storage.is_encrypted) {
            p = app.user.get_key()
                .then(user_key => user_key.primaryKey.isDecrypted ?
                    user_key :
                    decrypt_user_key(passphrase_input, user_key))
                .then(user_key => this.storage.get_key(user_key));
        } else {
            p = Promise.resolve(null);
        }

        p.then(storage_key => {
                return app.session.get_file(`/storages/${this.storage.id}/${this.fullname}`)
                    .then(data => this.storage.is_encrypted ? decrypt(data, storage_key) : data);
            })
            .then(raw_file => {
                let url = URL.createObjectURL(new Blob([raw_file]));
                let a = document.createElement("a");
                a.href = url;
                a.download = this.name;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            })
            .then(r => console.log('encrypted file:', r), err => {
                if (err instanceof passphrase_input.constructor.UserCancelError)
                    return;
                console.log('Download attempt failed:', err, err.stack);
            });
    }
}
