var template = require('./template.marko');
var todoService = require('src/services/todo');
var TodoAppState = require('src/app/todo/TodoAppState');

module.exports = function(req, res) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    template.render({
            todoStateProvider: function todoStateProvider(callback) {
                todoService.readAllTodos(
                    {},
                    function(err, result) {
                        if (err) {
                            return callback(err);
                        }

                        var appState = new TodoAppState({
                            todos: result.todos,
                            filter: 'all'
                        });

                        callback(null, appState);
                    });
            }
        },
        res);
};