
window.get_cookie = get_cookie;

/**
 * Get a specific cookie value by its key.
 *
 * @param key {string}
 * @return {string} the cookie value if it exists; otherwise, returns an empty string.
 */
export function get_cookie(key) {
    return document.cookie.replace(new RegExp(`(?:(?:^|.*;\\s*)${key}\\s*\\=\\s*([^;]*).*$)|^.*$`), '$1');
}

/**
 * Set or replace a cookie.
 *
 * @param key {string}
 * @param value {string}
 */
export function set_cookie(key, value) {
    document.cookie = `${key}=${value}`;
}

/**
 * Remove a cookie.
 *
 * @param key {string}
 */
export function remove_cookie(key) {
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
