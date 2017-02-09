var template = require('./template.marko');
var nextId = 0;

module.exports = function(req, res) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    var todoState = Promise.resolve({
        todos: [
            {
                title: 'Learn marko',
                completed: true,
                id: nextId++
            },
            {
                title: 'Build an awesome web app',
                completed: false,
                id: nextId++
            },
            {
                title: 'Profit',
                completed: false,
                id: nextId++
            }
        ],
        filter: 'all'
    });

    res.marko(template, {
        todoState: todoState
    });
};