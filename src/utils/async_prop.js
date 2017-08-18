
import {safe_exec_callback} from '../utils/callbacks';


/**
 * Wrapper of asynchronously-loaded property
 *
 * It handles all elements related to the loading of an arbitrary value:
 * - the different states (loading, error, loaded)
 * - concurrent access to load the values
 *
 * Warning: the `instanceof` operator doesn't work with AsyncProp instances.
 *
 * @template T
 */
export default class AsyncProp {
    constructor() {
        /*
         * `this.ref` is the object returned by the constructor. It means all properties acceded for the instance are
         * stored in `this.ref`.
         * Also, all methods except the constructor and `_call()` will reference `this.ref` as `this`.
         */
        this.ref = this._call.bind(this);
        this.ref.constructor = this.constructor;
        this.ref.prototype = this.prototype;
        Object.setPrototypeOf(this.ref, this.constructor.prototype);

        /**
         * Value wrapped, if set. `undefined` means there is no value.
         * @type {undefined|T}
         */
        this.ref.value = undefined;

        /** @type {?Error} */
        this.ref.error = null;

        /** @type {?Promise} */
        this.ref.promise = null;

        /**
         * Callback executed when an error occurs (during loading)
         * @type {?function(error: Error)}
         */
        this.ref.onerror = null;

        return this.ref;
    }

    /**
     * Getter/Setter of the wrapped value
     *
     * It's called by a direct call of the AsyncProp instance
     *
     * @param {T} [new_value] - if set, replace the value.
     * @return {undefined|T} - the last value set (or undefined)
     *
     * @example
     * let prop = new AsyncProp();
     * prop(33); // setter
     * let value = prop(); // getter
     */
    _call(new_value = undefined) {
        let that = this.ref;
        if (new_value !== undefined) {
            that.value = new_value;
            that.error = null;
        }
        return that.value;
    }

    /**
     * Load (or reload) the data.
     *
     * When called, the loader is called. The AsyncProp is set in 'loading' state until the promise resolution.
     * At this point, the AsyncProp use the promise result to set its value or its error.
     *
     * Note that if load() is called when the prop is already in loading, the new loader is ignored.
     *
     * @param {function(): Promise<T>} loader
     * @return {Promise<AsyncProp<T>>} new Promise resolving with this AsyncProp (after values being set).
     *   The promise is always successful: errors are captured in the AsyncProp instance.
     */
    load(loader) {
        if (this.promise) // reuse ongoing promise
            return this.promise;

        this.error = null;
        this.promise = loader().then(res => {
            this.promise = null;
            this(res);
            return this;
        }, err => {
            this.promise = null;
            this.set_error(err);

            safe_exec_callback(this.onerror, 'AsyncProp:onerror', err);
            return this;
        });
        return this.promise;
    }

    /**
     * Indicate if there is an ongoing data loading.
     *
     * Noet that the prop can have data and be in loading (in case of refresh).
     *
     * @return {boolean} true if data are being loaded (or being refreshed); false otherwise.
     */
    is_loading() {
        return this.promise !== null;
    }

    /**
     * Set the property in error state (and erase the value).
     *
     * Warning: it does NOT trigger the `onerror` callback.
     *
     * @param {Error} err - new error
     */
    set_error(err) {
        this.error = err;
        this.value = undefined;
    }

    /**
     * Call one of the three callbacks, depending on the status of the property.
     *
     * All callbacks are optionals. If a non-defined (or `null`) callback should be called, the `null` value is
     * returned instead.
     *
     * The loading callback is only called during the initial loading. On subsequent loadings, the "loaded" callback is
     * used (as there is the previous value).
     *
     * @template U
     * @param {?function(value: T): U} [loaded] - Called if the property is loaded
     * @param {?function(): U} [loading] - Called if the property is not yet loaded
     * @param {?function(error: Error): U} [failed] - Called if the loading has failed
     */
    dispatch(loaded, loading, failed) {
        if (this.error)
            return failed ? failed(this.error) : null;
        if (this.value === undefined)
            return loading ? loading() : null;
        return loaded ? loaded(this.value) : null;
    }
}
