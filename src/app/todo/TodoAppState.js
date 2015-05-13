var inherit = require('raptor-util/inherit');
var TodoCollection = require('./TodoCollection');

function AppState(state) {
    if (!state) {
        state = {};
    }

    this.todoCollection = new TodoCollection(state.todos || []);
    this.filter = state.filter || 'all';
    this.editingTodoId = state.editingTodoId || null;
    this.editingTodoTitle = state.editingTodoTitle || null;
}

AppState.prototype = {
    set: function(name, value) {
        if (typeof name === 'object') {
            var newState = name;
            for (var k in newState) {
                if (newState.hasOwnProperty(k)) {
                    this.set(k, newState[k]);
                }
            }
            return;
        }

        var curValue = this[name];

        if (curValue === value) {
            return;
        }

        this[name] = value;

        this.emit('change');
    }
};

inherit(AppState, require('events').EventEmitter);

module.exports = AppState;

