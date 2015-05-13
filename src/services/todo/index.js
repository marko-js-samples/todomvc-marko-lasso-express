module.exports = require('src/util/service-helper').createService(
    require('./routes'),
    require('./handlers'));