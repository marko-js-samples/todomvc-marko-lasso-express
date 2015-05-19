// Polyfill to support native ES6 promises
require("native-promise-only");

var TodoApp = require('./TodoApp');

var app = new TodoApp({
    filter: 'all',
    items: null // The todo items are initially empty since we rendered on the server
});

module.exports = window.app = app;

window.addEventListener('load', function load(event){
    window.removeEventListener('load', load);

    // Don't do the initial server sync if we are being loaded in
    // a test environment that uses a local file system file
    var url = document.location.toString();
    if (url.indexOf('http') !== -1) {
        app.initialServerSync(false);
    }

});

