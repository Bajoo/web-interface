

/**
 * Create a property, similar to old mthril's `m.prop()` function.
 *
 * @param default_value
 * @returns {Function}
 */
export default function prop(default_value = undefined) {
    let _value = default_value;
    return function(value) {
        if (value !== undefined) _value = value;
        return _value;
    };
}
