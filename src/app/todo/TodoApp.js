var inherit = require('raptor-util/inherit');
var TodoAppState = require('./TodoAppState');
var todoService = require('src/services/todo');
var TodoCollection = require('./TodoCollection');
var notificationsApp = require('src/app/notifications');

function TodoApp(state) {
    var self = this;

    this.initialServerSyncPromise = null;
    this.state = new TodoAppState(state);

    function emitChangeEvent() {
        self.emit('change', self.state);
    }

    this._emitChangeEvent = emitChangeEvent;

    this.state.on('change', emitChangeEvent);
}

TodoApp.prototype = {


    setFilter: function(filter) {
        this.state.set('filter', filter);
    },

    _updateTodoItem: function(todo) {
        var self = this;
        var todoCollection = this.state.todoCollection;

        this.state.set('todoCollection', new TodoCollection(todoCollection.getAllTodos()));

        var todoId = todo.id;

        notificationsApp.startAsyncAction(function(done) {
            todoService.updateTodo(
                {
                    todoId: todoId,
                    todoData: todo
                },
                function(err) {
                    if (err) {
                        return done('Unable to mark todo as completed. It is recommended to reload the page.');
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

        state.set('todoCollection', new TodoCollection(todos));

        if (todoIdsToDestroy.length) {
            notificationsApp.startAsyncAction(function(done) {
                todoService.deleteTodos(
                    {
                        todoIds: todoIdsToDestroy
                    },
                    function(err) {
                        if (err) {
                            return done('Unable to remove completed todo todos. It is recommended to reload the page.');
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
                self._updateTodoItem(todo);
            }
        });
    },

    removeTodo: function(todoId) {
        var state = this.state;

        this.initialServerSync().then(function() {
            var todos = state.todoCollection.getAllTodos();

            // Let's filter out the todo todo in our client-side state...
            todos = todos.filter(function(todoItem) {
                return todoItem.id !== todoId;
            });

            state.set('todoCollection', new TodoCollection(todos));

            notificationsApp.startAsyncAction(function(done) {
                todoService.deleteTodo(
                    {
                        todoId: todoId
                    },
                    function(err) {
                        if (err) {
                            return done('Unable to remove todo todo. It is recommended to reload the page.');
                        }

                        done();
                    });
            });
        });
    },

    toggleAllTodosCompleted: function(completed) {
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
                state.set('todoCollection', new TodoCollection(todos));

                notificationsApp.startAsyncAction(function(done) {
                    todoService.toggleTodosCompleted(
                        {
                            todoIds: modifiedTodoIds,
                            completed: completed
                        },
                        function(err) {
                            if (err) {
                                return done('Unable to update todo todos. It is recommended to reload the page.');
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
            // Add the pending todo todo
            var pendingTodo = {
                title: todoData.title,
                pending: true
            };

            var allTodos = state.todoCollection.getAllTodos();
            allTodos.push(pendingTodo);
            state.set('todoCollection', new TodoCollection(allTodos));


            notificationsApp.startAsyncAction(function(done) {
                todoService.createTodo(
                    {
                        todoData: todoData
                    },
                    function(err, newTodo) {
                        if (err) {
                            return done('Unable to create todo todo. It is recommended to reload the page.');
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

    setAllTodosActive: function() {
    },

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
            // with the updated todo todo.
            this.state.set('todoCollection', new TodoCollection(this.state.todoCollection.getAllTodos()));

            this._updateTodoItem(todo);
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
                    // Don't trigger a change event for the initial sync
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