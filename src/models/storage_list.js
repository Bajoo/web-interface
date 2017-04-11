
import Storage from './storage';


export default class StorageList {
    constructor(session, data_list) {
        this.session = session;
        this.my_bajoo = null;
        this.shares =  [];

        let storages = data_list.map(s => new Storage(session, s));
        let idx = storages.findIndex(s => s.name === 'MyBajoo');
        if (idx !== -1) {
            this.my_bajoo = storages[idx];
            storages.splice(idx, 1);
        }

        this.shares = storages;
    }

    static from_user_session(user) {
        return user.session.request({
            url: '/storages'
        }).then(data => new StorageList(user.session, data));
    }

}
