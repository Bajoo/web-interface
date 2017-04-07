
import app from '../app';
import {decrypt} from '../encryption';


export default class File {

    constructor(storage, {name, hash, last_modified, bytes}) {
        this.storage = storage;

        this.fullname = name;
        this.name = name.split('/').pop();
        this.hash = hash;
        this.bytes = bytes;
        this.last_modified = new Date(last_modified);
    }

    download() {
        console.log('download ...');
        app.user.get_key(app.session)
            .then(user_key => {
                if (!user_key.primaryKey.isDecrypted) {
                    if (!user_key.decrypt(prompt('Passphrase')))
                        throw new Error('Bad passphrase!');
                }

                return this.storage.get_key(app.session, user_key);
            })
            .then(storage_key => {
                return app.session.get_file(`/storages/${this.storage.id}/${this.fullname}`)
                    .then(data => decrypt(data, storage_key));
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
            .then(r => console.log('encrypted file:', r), err => console.log('ERR', err, err.stack));
    }
}
