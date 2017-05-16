
import {armor, crypto, enums, key, message, default as openpgp} from 'openpgp';
import {openpgp_worker_path} from './utils/loader';


/**
 * This function must be called before any call to openPGP.
 * It starts the web worker for doing all the heavy tasks.
 */
export function initialize() {
    openpgp.initWorker({path: openpgp_worker_path});
}


/**
 * Convert binary data into a PGP key.
 * @param {Uint8Array} data raw content of the PGP key
 * @return {openpgp.Key}
 */
export function bin2key(data) {
    let armored_key = armor.encode(enums.armor.private_key, data);
    let result = key.readArmored(armored_key);

    if ('err' in result && result.err.length !== 0) {
        console.error('Loading of PGP key from binary data failed', result);
        throw new Error('Loading of PGP key failed');
    }
    if (result.keys.length !== 1)
        console.warn('One and only one key should have been loaded', result);
    return result.keys[0];
}


/**
 * Export PGP key into binary data.
 * @param {openpgp.Key} key
 * @return {Uint8Array}
 */
export function key2bin(key) {
    return key.toPacketlist().write();
}


/**
 * Decrypt data using a PGP key
 *
 * @param data {Uint8Array}
 * @param key {openpgp.Key}
 * @return {Promise.<Uint8Array>}
 */
export function decrypt(data, key) {
    return openpgp.decrypt({
        message: message.read(data),
        privateKey: key,
        format: 'binary'
    }).then(result => result.data);
}


/**
 * Encrypt data decipherable by a PGP key
 *
 * @param data {Uint8Array|String}
 * @param key {openpgp.Key|openpgp.Key[]}
 * @return {Promise.<Uint8Array>}
 */
export function encrypt(data, key) {
    return openpgp.encrypt({
        data,
        publicKeys: Array.isArray(key) ? key : [key],
        armor: false
    }).then(result => result.message.packets.write());
}


/**
 * Create a new PGP key
 *
 * @param {String} name (key metadata)
 * @param {String} email (key metadata)
 * @param {?String} passphrase passphrase of the key. can be null for no passphrase.
 * @return {Promise.<openpgp.Key>}
 */
export function generate_key(name, email, passphrase=null) {
    return openpgp.generateKey({passphrase, userIds: [{name, email}]}).then(key => key.key);
}


/**
 * Sha256 hash
 * @type {Function}
 * @param {String} input
 * @return {Uint8Array} resulting hash
 */
export let sha256 = crypto.hash.sha256;
