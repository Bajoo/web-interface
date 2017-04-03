
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
        return session.storage_request({
            url: `/storages/${this.id}`,
            data: { // GET params
                format: 'json',
                prefix: folder ? `${folder}/` : '',
                delimiter: '/'
            },
            bakground: true
        })
            .then(result => result.filter(item => item.name != '.key'))
            .then(result => result.map(item => {  // Remove directory prefix
            if ('name' in item) {
                item.name = item.name.split('/').pop();
            }
            if ('subdir' in item) {
                item.subdir = item.subdir.substr(0, item.subdir.length - 1).split('/').pop();
            }
            return item;
        })).then(result => result.map(item => { // Convert last_mdified into a Date bject
            if ('last_modified' in item)
                item.last_modified = new Date(item.last_modified);
            return item;
        }));
    }
}
