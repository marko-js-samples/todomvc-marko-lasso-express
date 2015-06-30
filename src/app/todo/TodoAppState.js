var inherit = require('raptor-util/inherit');
var TodoCollection = require('./TodoCollection');

// [
//     {
//         title: 'Go to the grocery store',
//         completed: false
//     },
//     {
//         title: 'Ship item',
//         completed: true
//     },
//     {
//         title: 'Respond to email',
//         completed: false
//     }
// ]

function TodoAppState(state) {
    if (!state) {
        state = {};
    }

    // Normalize the state based on the state object provided
    this.todoCollection = new TodoCollection(state.todos || []);
    this.filter = state.filter || 'all';
    this.editingTodoId = state.editingTodoId || null;
    this.editingTodoTitle = state.editingTodoTitle || null;
}

TodoAppState.prototype = {
    /**
     * Changes one of the state properties. If the provided
     * value is equal to the current value then nothing happens.
     * If the provided value is different then the state property
     * is updated and a "change" event is emitted.
     *
     *
     * @param {String} name The name of the state property to change
     * @param {Object} value The new value of the state property
     */
    set: function(name, value) {

        var curValue = this[name];

        if (curValue === value) {
            return;
        }

        this[name] = value;

        this.emit('change');
    }
};

// Inherit from EventEmitter
inherit(TodoAppState, require('events').EventEmitter);

module.exports = TodoAppState;