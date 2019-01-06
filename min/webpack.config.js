const webpack_generator = require('../webpack_base.config');

module.exports = webpack_generator(
    'abs',
    '.user.js',
    './min',
    false);