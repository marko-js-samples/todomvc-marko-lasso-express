var todoApp = require('src/app/todo');

module.exports = require('marko-widgets').defineComponent({
    template: require.resolve('./template.marko'),
    getInitialState: function(input) {
        return {

        };
    },
    getTemplateData: function(state, input) {
        return {

        };
    },

    handleFormSubmit: function(event) {
        var titleInput = document.getElementById('new-todo');

        var todoTitle = titleInput.value;
        todoApp.addNewTodo({
            title: todoTitle
        });

        titleInput.value = '';

        event.preventDefault();
    }
});