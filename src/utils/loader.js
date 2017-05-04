
let loader;

/**
 * path to the openpgp web worker script
 * @type {String}
 */
let openpgp_worker_path;

try {
    // webpack loader
    loader = path => require(`../../static/${path}`);
    openpgp_worker_path = require('../../node_modules/openpgp/dist/openpgp.worker.min.js');
} catch (err) {
    // natural mode: we return a relative URL.
    loader = path => `./static/${path}`;
    openpgp_worker_path = './node_modules/openpgp/dist/openpgp.worker.min.js';
}


export default loader;
export {openpgp_worker_path};
