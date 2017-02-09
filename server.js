require('require-self-ref');
require('marko/node-require');
require('lasso/node-require-no-op').enable('.less', '.css');
require('marko/express');

var express = require('express');
var compression = require('compression'); // Provides gzip compression for the HTTP response

var isProduction = process.env.NODE_ENV === 'production';

// Configure the RaptorJS Optimizer to control how JS/CSS/etc. is
// delivered to the browser
require('lasso').configure({
    plugins: [
        'lasso-less', // Allow Less files to be rendered to CSS
        'lasso-marko' // Allow Marko templates to be compiled and transported to the browser
    ],
    outputDir: __dirname + '/static', // Place all generated JS/CSS/etc. files into the "static" dir
    bundlingEnabled: isProduction, // Only enable bundling in production
    minify: isProduction, // Only minify JS and CSS code in production
    fingerprintsEnabled: isProduction, // Only add fingerprints to URLs in production
    bundles: [ // Create a separate JavaScript bundle for jQuery
        {
            name: 'jquery',
            dependencies: [
                'require: jquery' // Put only the jquery module in this bundle
            ]
        }
    ]
});

var app = express();

var port = process.env.PORT || 8080;

// Enable gzip compression for all HTTP responses
app.use(compression());

app.use(require('lasso/middleware').serveStatic());

app.get('/', require('./src/pages/home'));

app.use(require('./src/pages/error'));

app.listen(port, function() {
    console.log('Listening on port %d', port);

    // The browser-refresh module uses this event to know that the
    // process is ready to serve traffic after the restart
    if (process.send) {
        process.send('online');
    }
});