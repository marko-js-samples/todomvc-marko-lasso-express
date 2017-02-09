var EventEmitter = require('events');

var nextId = 0;

/**
 * This is the "class" definition for our Todo app. On the client-side
 * we create a single instance of this class and use it as the default
 * exports for the "src/app/todo.js" module. The TodoApp instances
 * expose methods can be used to modify the internal application state.
 * When the internal state is changed, a "change" event is emitted
 * along with the new state.
 *
 * The TodoApp constructor should be provided with an object with the
 * initial state. The provided state object is wrapped and normalized
 * by the TodoAppState module.
 *
 * @param {Object} state The initial state for the todo app.
 */

class TodoApp extends EventEmitter {
    constructor() {
        super();

        this._todos = [];
        this._filter = 'all';
    }

    set todos(newTodos) {
        this._todos = newTodos;
        this._emitChange();
    }

    get todos() {
        return this._todos;
    }

    set filter(newFilter) {
        if (this._filter === newFilter) {
            return;
        }
        this._filter = newFilter;
        this._emitChange();
    }

    get filter() {
        return this._filter;
    }

    _emitChange() {
        this.emit('change', {
            todos: this.todos,
            filter: this.filter
        });
    }

    /**
     * Private method for committing the changes to a todo item by
     * making a service call to the backend.
     *
     * @param {Object} todo The todo item to update on the backend
     */
    updateTodo(todoId, newProps) {
        this.todos = this.todos.slice(0);

        for (var i=0; i<this.todos.length; i++) {
            var todo = this.todos[i];
            if (todo.id === todoId) {
                var newTodo = Object.assign({}, todo, newProps);
                this.todos[i] = newTodo;
                break;
            }
        }
    }

    clearCompleted() {
        this.todos = this.todos.filter((todo) => {
            return todo.completed === true ? false : true;
        });
    }

    setTodoCompleted(todoId, completed) {
        this.updateTodo(todoId, { completed: completed });
    }

    removeTodo(todoId) {
        this.todos = this.todos.filter((todo) => {
            return todo.id === todoId ? false : true;
        });
    }

    toggleAllTodosCompleted(completed) {
        this.todos = this.todos.map((todo) => {
            if (todo.completed === completed) {
                return todo;
            } else {
                return Object.assign({}, todo, { completed: completed });
            }
        });
    }

    addNewTodo(todoData) {
        this.todos = this.todos.concat({
            title: todoData.title,
            id: 'c' + (nextId++),
            completed: false
        });
    }
}

module.exports = TodoApp;