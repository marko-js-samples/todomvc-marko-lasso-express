// Polyfill to support native ES6 promises
var TodoApp = require('./TodoApp');

module.exports = window.app = new TodoApp();