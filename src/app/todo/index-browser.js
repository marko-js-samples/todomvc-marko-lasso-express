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
    app.initialServerSync(false);
});

