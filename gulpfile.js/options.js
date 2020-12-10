const envOpt = {
    string: 'env',
    default: { env: 'develop' }
}
const opts = require('minimist')(process.argv.slice(2), envOpt);

exports.opts = opts;