module.exports = [
    {
        name: 'readAllTodos',
        method: 'GET',
        path: '/api/todos'
    },
    {
        name: 'updateTodo',
        method: 'PUT',
        path: '/api/todo/:todoId',
        bodyParam: 'todoData'
    },
    {
        name: 'createTodo',
        method: 'POST',
        path: '/api/todos',
        bodyParam: 'todoData'
    },
    {
        name: 'deleteTodos',
        method: 'POST',
        path: '/api/deleteTodos'
    },
    {
        name: 'deleteTodo',
        method: 'DELETE',
        path: '/api/todo/:todoId'
    },
    {
        name: 'toggleTodosCompleted',
        method: 'POST',
        path: '/api/toggleTodosCompleted'
    }
];