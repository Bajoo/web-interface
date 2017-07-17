

/**
 * Helper for logging a message when a promise fails.
 *
 * @param {String} message - logged message describing the context.
 * @return {function(err: Error)} function which log the message and re-throw the error.
 */
export function log_failed_promise(message) {
    return err => {
        console.error(message, err);
        throw err;
    };
}


/**
 * Execute a callback in a safe way
 *
 * Not-defined callback (set to null) are ignored.
 * Errors thrown by the callback are logged in the console and ignored.
 *
 * @param {function} callback
 * @param {String} call_context - short string describing the context (ex: "Task:onchange"), used for debug
 * @param [args] - arguments transmitted to the callback
 */
export function safe_exec_callback(callback, call_context, ...args) {
    try {
        if (callback)
            callback(...args);
    } catch (err) {
        console.error('Callback execution threw an unexpected error in context:', call_context);
        console.error(err);
    }
}
