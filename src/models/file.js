
import Download from '../models/download';


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
        let dl = new Download(this);
        dl.start(passphrase_input);
        return dl;
    }
}
