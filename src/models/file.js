
import app from '../app';
import {decrypt} from '../encryption';


export default class File {

    constructor(storage, {name, hash, last_modified, bytes}) {
        this.storage = storage;

        this.fullname = name;
        this.name = name.split('/').pop();
        this.hash = hash;
        this.bytes = bytes;

        // TODO: fix hack in swift server
        this.last_modified = new Date(last_modified + 'Z');
    }

    download({passphrase_input}) {
        console.log('download ...');

        let p = null;

        if (this.storage.is_encrypted) {
            p = app.user.get_key()
                .then(user_key => user_key.primaryKey.isDecrypted ?
                    user_key :
                    passphrase_input.decrypt_key(user_key))
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
