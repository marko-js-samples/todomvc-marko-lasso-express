var todoApp = require('src/app/todo');

module.exports = require('marko-widgets').defineComponent({
    template: require.resolve('./template.marko'),
    getInitialState: function(input) {
        return {
            todos: input.todos || []
        };
    },
    getTemplateData: function(state, input) {
        var toggleAllChecked = true;

        for (var i=0; i<state.todos.length; i++) {
            var todoData = state.todos[i].todoData;
            if (todoData.completed === false) {
                toggleAllChecked = false;
                break;
            }
        }

        return {
            todos: state.todos,
            toggleAllChecked: toggleAllChecked
        };
    },

    handleToggleAllOnChange: function(event, input) {
        var setCompleted = input.checked;
        todoApp.toggleAllTodosCompleted(setCompleted);
    }
});