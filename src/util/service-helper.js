var extend = require('raptor-util/extend');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

exports.createService = function(routes, handlers) {
    var service = {
        addRoutes: function(app) {
            routes.forEach(function(route) {

                if (!route.name) {
                    throw new Error('Route name is required.');
                }

                var method = route.method || 'GET';
                var path = route.path;
                var bodyParam = route.bodyParam;
                var handlerFunc = handlers[route.name];

                if (!handlerFunc) {
                    throw new Error('Missing handler for route "' + route.name + '"');
                }

                var middleware = [];

                if (bodyParam) {
                    middleware.push(jsonParser);
                }

                middleware.push(function(req, res) {

                    var args = {};
                    if (req.params) {
                        extend(args, req.params);
                    }

                    if (req.query) {
                        for (var k in req.query) {
                            if (req.query.hasOwnProperty(k)) {
                                var v = req.query[k];
                                if (v === 'true') {
                                    v = true;
                                } else if (v === 'false') {
                                    v = false;
                                }
                                args[k] = v;
                            }
                        }
                    }

                    if (bodyParam) {
                        args[bodyParam] = req.body;
                    }

                    handlerFunc(args, function(err, data) {
                        if (err) {
                            console.error(module.id, err);
                            res.status(500).send({
                                error: 'Server error'
                            });
                            return;
                        }

                        res.json(data);
                    });
                });

                app[method.toLowerCase()](path, middleware);
            });
        }
    };

    extend(service, handlers);

    return service;
};