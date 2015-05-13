var request = require('browser-request');
var isObjectEmpty = require('raptor-util/isObjectEmpty');

function queryStringStringify(queryStringObject) {
    if (isObjectEmpty(queryStringObject)) {
        return '';
    }

    var queryStringParts = [];

    for (var k in queryStringObject) {
        if (queryStringObject.hasOwnProperty(k)) {
            var v = queryStringObject[k];
            if (Array.isArray(v)) {
                v = v.join(',');
            }
            queryStringParts.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
        }
    }

    return '?' + queryStringParts.join('&');
}

exports.createService = function(routes) {
    var service = {};

    routes.forEach(function(route) {
        var method = route.method || 'GET';
        var path = route.path;
        var bodyParam = route.bodyParam;
        var pathParamNames = {};
        var pathParts = path.split('/');
        var methodName = route.name;

        pathParts
            .filter(function(pathPart) {
                return pathPart.charAt(0) === ':';
            })
            .forEach(function(pathParam) {
                pathParamNames[pathParam.substring(1)] = pathParam;
            });

        service[methodName] = function(args, callback) {
            var queryString = {};
            var body = null;

            for (var k in args) {
                if (args.hasOwnProperty(k)) {
                    var v = args[k];

                    if (k === bodyParam) {
                        body = v;
                    } else if (!pathParamNames[k]) {
                        if (Array.isArray(v)) {
                            v = v.join(',');
                        }

                        queryString[k] = v;
                    }
                }
            }

            var url = pathParts.map(function(pathPart) {
                    if (pathPart.charAt(0) === ':') {
                        var value = args[pathPart.substring(1)];
                        if (Array.isArray(value)) {
                            value = value.join(',');
                        }
                        return value;
                    } else {
                        return pathPart;
                    }
                })
                .join('/');

            url += queryStringStringify(queryString);

            var requestArgs = {
                method: method,
                url: url,
                json: true
            };

            if (bodyParam && args[bodyParam] != null) {
                requestArgs.body = JSON.stringify(args[bodyParam]);
            }

            request(
                requestArgs,
                function (err, response, body) {
                    if (err) {
                        return callback(err);
                    }

                    if (response.statusCode !== 200) {
                        var errorMessage = 'Response not OK for ' + method + ' ' + url + ' (' + methodName + '). Status code: ' + response.statusCode;
                        console.error(errorMessage);
                        return callback(new Error(errorMessage));
                    }

                    // Introduce an artificial delay for illustration purposes only
                    setTimeout(function() {
                        callback(null, body);
                    }, 300);

                    // callback(null, body);
                });
        };
    });

    return service;
};