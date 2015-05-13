var inherit = require('raptor-util/inherit');
var TodoAppState = require('./TodoAppState');
var todoService = require('src/services/todo');
var TodoCollection = require('./TodoCollection');
var notificationsApp = require('src/app/notifications');

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
function TodoApp(state) {
    var self = this;

    this.initialServerSyncPromise = null;
    this.state = new TodoAppState(state);

    function emitChangeEvent() {
        self.emit('change', self.state);
    }

    this._emitChangeEvent = emitChangeEvent;

    // When the internal state changes also emit a change event on
    // the app and pass along the updated state.
    this.state.on('change', emitChangeEvent);
}

TodoApp.prototype = {

    /**
     * Changes the active filter for the todos.
     *
     * @param {String} filter The filter (either "all", "active" or "completed")
     */
    setFilter: function(filter) {
        this.state.set('filter', filter);
    },

    _rebuildTodoCollection: function(todos) {
        if (!todos) {
            todos = this.state.todoCollection.getAllTodos();
        }
        this.state.set('todoCollection', new TodoCollection(todos));
    },

    /**
     * Private method for committing the changes to a todo item by
     * making a service call to the backend.
     *
     * @param {Object} todo The todo item to update on the backend
     */
    _updateTodo: function(todo) {
        var self = this;

        this._rebuildTodoCollection();

        var todoId = todo.id;

        notificationsApp.startAsyncAction(function(done) {
            todoService.updateTodo(
                {
                    todoId: todoId,
                    todoData: todo
                },
                function(err) {
                    if (err) {
                        return done('Unable to save todo: ' + todo.title);
                    }

                    self.addNotification({
                        message: 'Todo saved: ' + todo.title,
                        type: 'message',
                        dismissable: true,
                        duration: 3000
                    });

                    done();
                });
        });

    },

    clearCompleted: function() {
        var state = this.state;

        var todos = state.todoCollection.getAllTodos();

        var todoIdsToDestroy = [];

        todos = todos.filter(function(todo) {
            var completed = todo.completed === true;
            if (completed) {
                todoIdsToDestroy.push(todo.id);
            }
            return completed === false;
        });

        if (todoIdsToDestroy.length) {
            this._rebuildTodoCollection(todos);

            notificationsApp.startAsyncAction(function(done) {
                todoService.deleteTodos(
                    {
                        todoIds: todoIdsToDestroy
                    },
                    function(err) {
                        if (err) {
                            return done('Unable to remove completed todos. It is recommended to reload the page.');
                        }

                        done();
                    });
            });
        }
    },

    setTodoCompleted: function(todoId, completed) {
        var self = this;
        var state = this.state;

        this.initialServerSync().then(function() {
            var todoCollection = state.todoCollection;
            var todo = todoCollection.getTodo(todoId);
            if (todo) {
                todo.completed = completed;
                self._updateTodo(todo);
            }
        });
    },

    removeTodo: function(todoId) {
        var state = this.state;
        var self = this;

        this.initialServerSync().then(function() {
            var todos = state.todoCollection.getAllTodos();

            // Let's filter out the todo in our client-side state...
            todos = todos.filter(function(todoItem) {
                return todoItem.id !== todoId;
            });

            self._rebuildTodoCollection(todos);

            notificationsApp.startAsyncAction(function(done) {
                todoService.deleteTodo(
                    {
                        todoId: todoId
                    },
                    function(err) {
                        if (err) {
                            return done('Unable to remove todo. It is recommended to reload the page.');
                        }

                        done();
                    });
            });
        });
    },

    toggleAllTodosCompleted: function(completed) {
        var self = this;
        var state = this.state;

        this.initialServerSync().then(function() {
            var todoCollection = state.todoCollection;
            var todos = todoCollection.getAllTodos();
            var modifiedTodoIds = [];

            todos.forEach(function(todo) {
                if (todo.completed !== completed) {
                    modifiedTodoIds.push(todo.id);
                    todo.completed = completed;
                }
            });

            if (modifiedTodoIds.length) {
                self._rebuildTodoCollection(todos);

                notificationsApp.startAsyncAction(function(done) {
                    todoService.toggleTodosCompleted(
                        {
                            todoIds: modifiedTodoIds,
                            completed: completed
                        },
                        function(err) {
                            if (err) {
                                return done('Unable to update todos. It is recommended to reload the page.');
                            }

                            done();
                        });
                });
            }
        });
    },

    addNewTodo: function(todoData) {
        var self = this;
        var state = this.state;

        this.initialServerSync().then(function() {
            // Add the pending todo
            var pendingTodo = {
                title: todoData.title,
                pending: true
            };

            var allTodos = state.todoCollection.getAllTodos();
            allTodos.push(pendingTodo);
            self._rebuildTodoCollection(allTodos);

            notificationsApp.startAsyncAction(function(done) {
                todoService.createTodo(
                    {
                        todoData: todoData
                    },
                    function(err, newTodo) {
                        if (err) {
                            return done('Unable to create todo. It is recommended to reload the page.');
                        }

                        allTodos = state.todoCollection.getAllTodos();

                        // Remove the pending todo
                        allTodos = allTodos.filter(function(todo) {
                            return todo !== pendingTodo;
                        });


                        // Now add the newly created todo
                        allTodos.push(newTodo);

                        state.set('todoCollection', new TodoCollection(allTodos));

                        self.addNotification({
                            message: 'Todo created: ' + newTodo.title + '(' + newTodo.id + ')',
                            type: 'message',
                            dismissable: true,
                            duration: 3000
                        });

                        done();
                    });
            });
        });
    },

    /**
     * Enters edit mode for a todo item.
     *
     * Only one todo item can be in edit mode at a time. We store the
     * ID of the todo being edited as part of the state as "editingTodoId"
     * and we store the current text for the todo being edited as
     * "editingTodoTitle". The view can either exit editing mode
     * by saving the change to the todo title using the saveTodoEdit(newTitle)
     * method or by canceling the change to the todo title usng the cancelTodoEdit()
     * method.
     *
     * @param {String} todoId The ID of the todo item
     */
    enterEditModeForTodo: function(todoId) {
        var todo = this.state.todoCollection.getTodo(todoId);
        if (!todo) {
            return;
        }

        var self = this;

        this.initialServerSync().then(function() {
            self.state.set('editingTodoTitle', todo.title);
            self.state.set('editingTodoId', todoId);
        });
    },

    saveTodoEdit: function(newTitle) {
        var editingTodoId = this.state.editingTodoId;
        if (editingTodoId == null) {
            return;
        }

        var todo = this.state.todoCollection.getTodo(editingTodoId);
        if (todo.title !== newTitle) {
            todo.title = newTitle;

            // Trigger a state change for our todo collection by creating a new TodoCollection
            // with the updated todo.
            this._rebuildTodoCollection();

            this._updateTodo(todo);
        }

        this.cancelTodoEdit();
    },

    cancelTodoEdit: function() {
        this.state.set('editingTodoTitle', null);
        this.state.set('editingTodoId', null);
    },

    updateItemEditingText: function(newTitle) {
        this.state.set('editingTodoTitle', newTitle);
    },

    addNotification: function(notification) {
        notificationsApp.addNotification(notification);
    },

    initialServerSync: function(showIndicator) {
        var self = this;

        if (!this.initialServerSyncPromise) {
            this.initialServerSyncPromise = new Promise(function(resolve, reject) {
                todoService.readAllTodos({}, function(err, data) {
                    if (err) {
                        return reject(err);
                    }

                    var todos = data.todos;
                    // Don't trigger a change event for the initial sync by modifying
                    // the state object without going through the set() method.
                    self.state.todoCollection = new TodoCollection(todos);
                    resolve();
                });
            });
        }

        if (showIndicator !== false) {
            notificationsApp.startAsyncAction(function(done) {
                self.initialServerSyncPromise.then(function() {
                    done();
                });
            });
        }

        return this.initialServerSyncPromise;
    },

    getState: function() {
        return this.state;
    },

    onChange: function(callback) {
        this.on('change', callback);
    }
};

inherit(TodoApp, require('events').EventEmitter);

module.exports = TodoApp;