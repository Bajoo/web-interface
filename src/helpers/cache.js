

/**
 * Cache an async function using a local attribute.
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
