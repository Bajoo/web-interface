

/**
 * Cache an async function using a local attribute.
 *
 * Note: The same promise can be returned more than one. It means a reference returned by a cached
 * promise can be shared. To avoid weird bug in case of modification, the cached method can make a
 * copy explicitely.
 * Ex: `return cache({..}, query).then(Array.from)`
 *
 * @param option.target {Object} object containing the cached attribute
 * @param option.attr [string] name of the cached attribute present in target.
 * @param [option.reload=false] if true, invalidate cache and force a reload.
 * @param func {() => Promise} function loading the attribute value
 * @return {Promise} cached value.
 */
export default function cache({target, attr, reload = false}, func) {
    switch (true) {
        case reload:
        case target[attr] === undefined:
            target[attr] = func(); // jshint ignore:line
        case target[attr] instanceof Promise:
            return target[attr];
        default:
            return Promise.resolve(target[attr]);
    }
}
