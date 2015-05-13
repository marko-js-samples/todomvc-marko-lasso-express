function TodoCollection(todoArray) {
    this.allTodos = todoArray;
    this.todosById = {};

    for (var i=0; i<todoArray.length; i++) {
        var todo = todoArray[i];
        this.todosById[todo.id] = todo;
    }
}

TodoCollection.prototype = {
    getAllTodos: function() {
        return this.allTodos;
    },

    getTodo: function(todoId) {
        return this.todosById[todoId];
    }
};

module.exports = TodoCollection;