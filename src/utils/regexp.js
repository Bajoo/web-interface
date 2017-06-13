

/**
 * Escape a string in order to be safely inserted into a regexp.
 *
 * @param str {string}
 * @return {string}
 */
export function escape(str) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}
