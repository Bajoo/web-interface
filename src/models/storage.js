
export default class Storage {

    constructor({id, name, description, is_encrypted, rights}) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.is_encrypted = is_encrypted;

        this._rights = rights;
    }

    static get(session, storage_id) {
        return session.request({
            url: `/storages/${storage_id}`,
            background: true,
            type: Storage
        });
    }

    list_files(session, folder = '') {
        // Fake file list !!!
        return new Promise((resolve, reject) => {
            resolve([
                {name: 'fichier1.txt', "hash": "45b1586118dca835e79617b22618b0ab", "last_modified": "2017-03-12T09:59:31.508590", "bytes": 1667},
                {name: 'document.pdf', "hash": "45b1586118dca835e79617b22618b0ab", "last_modified": "2017-03-28T09:59:31.508590", "bytes": 1667},
                {subdir: 'A folder'},
                {subdir: 'Another folder'},
                {name: 'film.mkv', "hash": "45b1586118dca835e79617b22618b0ab", "last_modified": "2017-03-28T14:35:31.508590", "bytes": 1667}
            ]);
        }).then(result => result.map(item => {
            if ('last_modified' in item)
                item.last_modified = new Date(item.last_modified);
            return item;
        }));

        return session.storage_request({
            url: `/${this.id}/${folder}`,
            data: { // GET params
                format: 'json',
                prefix: folder,
                delimiter: '/'
            },
            bakground: true
        });
    }
}
