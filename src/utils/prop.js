

/**
 * Function representing an independent value.
 *
 * It acts has a getter/setter: with an argument, the value is changed (and the new value is returned).
 * Without argument, the value is returned.
 *
 * The purpose of this object is to easily share a non-object mutable property.
 *
 * @callback Prop
 * @param {T} [new_value] - if present, new value of the Prop.
 * @template T
 */


/**
 * Create a property, similar to old mithril `m.prop()` function.
 *
 * @param {T} default_value
 * @returns {Prop.<T>}
 * @template T
 */
export default function prop(default_value = undefined) {
    let _value = default_value;
    return function(value) {
        if (value !== undefined) _value = value;
        return _value;
    };
}
