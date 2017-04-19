
import {armor, enums, key, message, default as openpgp} from 'openpgp';


export function bin2key(data) {
    let armored_key = armor.encode(enums.armor.private_key, data);
    let result = key.readArmored(armored_key);

    if ('err' in result && result.err.length !== 0) {
        console.error('Bad key loading', result);
        // TODO: better error handling
        throw new Error(result);
    }
    if (result.keys.length !== 1)
        console.warn('One and only one key should have been loaded', result);
    return result.keys[0];
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
 * @param key {openpgp.Key}
 * @return {Promise.<Uint8Array>}
 */
export function encrypt(data, key) {
    return openpgp.encrypt({
        data,
        publicKeys: [key],
        armor: false
    }).then(result => result.message.packets.write());
}
