var todoApp = require('src/app/todo');

module.exports = require('marko-widgets').defineComponent({
    template: require.resolve('./template.marko'),
    getInitialState: function(input) {
        // Build the normalized state based on the input data
        return {
            remainingCount: input.remainingCount == null ? 0 : input.remainingCount,
            completedCount: input.completedCount == null ? 0 : input.completedCount,
            filter: input.filter || 'all'
        };
    },
    getTemplateData: function(state, input) {
        return {
            remainingCount: state.remainingCount,
            remainingTodosWord: state.remainingCount > 1 ? 'items' : 'item',
            completedCount: state.completedCount,
            filter: state.filter
        };
    },

    handleAllFilterClick: function(event) {
        todoApp.setFilter('all');
        event.preventDefault();
    },

    handleActiveFilterClick: function(event) {
        todoApp.setFilter('active');
        event.preventDefault();
    },

    handleCompletedFilterClick: function(event) {
        todoApp.setFilter('completed');
        event.preventDefault();
    },

    handleClearCompletedClick: function() {
        todoApp.clearCompleted();
    }
});