

export default class Status {

    constructor()  {
        this.type = null;
        this.message = null;
    }

    /**
     * @param type {?"error"}
     * @param message {string}
     */
    set(type, message) {
        this.type = type;
        this.message = message;
    }

    set_error(msg) {this.set('error', msg);}

    clear() {this.set(null, '');}
}
