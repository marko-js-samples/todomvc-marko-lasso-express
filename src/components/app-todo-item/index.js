// This UI component is tightly coupled with the todo application since the following code is loading the todo
var todoApp = require('src/app/todo');

module.exports = require('marko-widgets').defineComponent({
    template: require('./template.marko'),
    getInitialState: function(input) {
        var todoData = input.todoData || {};

        return {
            title: todoData.title || '',
            completed: todoData.completed === true,
            isEditing: input.isEditing === true,
            editingTitle: input.editingTitle,
            todoId: todoData.id,
            isPending: todoData.pending === true
        };
    },
    getTemplateData: function(state, input) {
        var liClassName = [];

        if (state.completed) {
            liClassName.push('completed');
        }

        if (state.isEditing) {
            liClassName.push('editing');
        }

        if (state.isPending) {
            liClassName.push('pending');
        }

        return {
            title: state.title,
            completed: state.completed,
            todoId: state.todoId,
            isEditing: state.isEditing,
            editingTitle: state.editingTitle,
            liClassName: liClassName.join(' ')
        };
    },

    saveEdit: function() {
        var newTitle = this.getEl('titleInput').value;
        todoApp.saveTodoEdit(newTitle);
    },

    cancelEdit: function() {
        this.getEl('titleInput').value = this.state.title;
        todoApp.cancelTodoEdit();
    },

    handleCheckboxChange: function(event, input) {
        var completed = input.checked === true;
        todoApp.setTodoCompleted(this.state.todoId, completed);
    },
    handleLabelDblClick: function() {
        if (this.state.isPending) {
            return;
        }

        var todoId = this.state.todoId;
        this.getEl('titleInput').value = this.state.title;
        todoApp.enterEditModeForTodo(todoId);
    },
    handleDestroyClick: function() {
        var todoId = this.state.todoId;
        todoApp.removeTodo(todoId);
    },
    onAfterUpdate: function() {
        if (this.state.isEditing) {
            this.getEl('titleInput').focus();
        }
    },
    handleInputBlur: function(event, input) {
        var newTitle = this.getEl('titleInput').value;
        todoApp.saveTodoEdit(newTitle);
    },
    handleInputKeyDown: function(event) {
        if (event.keyCode === 13 /* ENTER */) {
            this.saveEdit();
        } else if (event.keyCode === 27 /* ESC */) {
            this.cancelEdit();
        }
    },
    handleInputChange: function() {
        this.saveEdit();
    }
});