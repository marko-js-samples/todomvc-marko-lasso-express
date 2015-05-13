var todos = [
    {
        title: 'Go to the grocery store',
        completed: false
    },
    {
        title: 'Ship item',
        completed: true
    },
    {
        title: 'Respond to email',
        completed: false
    }
];

var nextTodoId = todos.length;

todos.forEach(function(todo, i) {
    todo.id = i.toString();
});

module.exports = {
    readAllTodos: function(args, callback) {
        callback(null, {
            todos: todos
        });
    },
    updateTodo: function(args, callback) {
        var todoId = args.todoId;
        var todoData = args.todoData;

        var todo;

        for (var i=0; i<todos.length; i++) {
            todo = todos[i];
            if (todo.id === todoId) {
                todos[i] = todoData;
                break;
            }
        }

        callback(null, todoData);
    },
    deleteTodos: function(args, callback) {
        var todoIds = args.todoIds;

        if (typeof todoIds === 'string') {
            todoIds = todoIds.split(',');
        }

        if (todoIds && todoIds.length) {
            var todoIdsLookup = todoIds.reduce(function(lookup, todoId) {
                    lookup[todoId] = true;
                    return lookup;
                },
                {});

            todos = todos.filter(function(todo) {
                return todoIdsLookup[todo.id] !== true;
            });
        }

        callback(null, {
            removedTodoIds: todoIds
        });
    },
    toggleTodosCompleted: function(args, callback) {
        var todoIds = args.todoIds;
        var completed = args.completed === true;

        if (typeof todoIds === 'string') {
            todoIds = todoIds.split(',');
        }

        if (todoIds && todoIds.length) {
            var todoIdsLookup = todoIds.reduce(function(lookup, todoId) {
                    lookup[todoId] = true;
                    return lookup;
                },
                {});

            todos.forEach(function(todo) {
                if (todoIdsLookup[todo.id]) {
                    todo.completed = completed;
                }
            });
        }

        callback(null, {
            updatedTodoIds: todoIds
        });
    },
    deleteTodo: function(args, callback) {
        var todoId = args.todoId;

        todos = todos.filter(function(todo) {
            return todo.id !== todoId;
        });

        callback(null, {});
    },
    createTodo: function(args, callback) {
        var todoData = args.todoData;
        todoData.id = (nextTodoId++).toString();

        todoData.completed = false;

        todos.push(todoData);

        callback(null, todoData);
    }
};