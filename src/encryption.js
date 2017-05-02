
import {armor, enums, key, message, default as openpgp} from 'openpgp';


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


export function generate_key(name, email) {
    return openpgp.generateKey({userIds: [{name, email}]}).then(key => key.key);
}
