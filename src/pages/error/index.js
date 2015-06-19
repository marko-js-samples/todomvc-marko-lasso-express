var template = require('./template.marko');
module.exports = function(err, req, res, next) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    var stackTrace = (err.stack || err).toString();

    template.render({
            stackTrace: stackTrace
        },
        res);
};