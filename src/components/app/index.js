var todoApp = require('src/app/todo');

module.exports = require('marko-widgets').defineComponent({
    template: require.resolve('./template.marko'),
    getInitialState: function(input) {
        // Use the provided application state as the state for this top-level
        // UI component
        return input.state;
    },
    getTemplateData: function(state, input) {
        var todos = state.todoCollection.getAllTodos();
        var filter = state.filter;
        var editingTodoId = state.editingTodoId;
        var editingTodoTitle = state.editingTodoTitle;

        var remainingCount = 0;
        var completedCount = 0;
        var visibleTodos = [];

        // Filter todos based on the current filter (either "all", "active" or "completed")
        function addVisibleTodo(rawTodo) {
            var todo = {
                todoData: rawTodo
            };

            if (editingTodoId === rawTodo.id) {
                todo.isEditing = true;
                todo.editingTitle = editingTodoTitle;
            }

            visibleTodos.push(todo);
        }

        todos.forEach(function(rawTodo) {
            if (filter === 'all' || rawTodo.pending) {
                addVisibleTodo(rawTodo);
            } else if (filter === 'active') {
                if (!rawTodo.completed) {
                    addVisibleTodo(rawTodo);
                }
            } else if (filter === 'completed') {
                if (rawTodo.completed) {
                    addVisibleTodo(rawTodo);
                }
            }

            if (rawTodo.completed) {
                completedCount++;
            } else {
                remainingCount++;
            }
        });

        return {
            todos: visibleTodos,
            filter: filter,
            remainingCount: remainingCount,
            completedCount: completedCount
        };
    },
    init: function() {
        var self = this;

        // Subscribe to the change state event. In response
        // to a state change event we will rerender the entire
        // app using the new state.
        this.subscribeTo(todoApp)
            .on('change', function(newState) {
                self.replaceState(newState);
            });
    }
});