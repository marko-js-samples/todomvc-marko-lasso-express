TodoMVC - Marko Widgets
==================================

# Overview

This variation of the TodoMVC sample app illustrates a new web application architecture for building high performance, _isomorphic_ webapps using the following technologies:

- [Marko](https://github.com/raptorjs/marko) - View rendering using HTML-based templates
- [Marko Widgets](https://github.com/raptorjs/marko-widgets) - Binding client-side behavior to rendered UI components
- [Lasso.js](https://github.com/lasso-js/lasso) - JavaScript and CSS bundling

For this application we introduce the <i><b>S</b>tate <b>A</b>pp <b>V</b>iew</i> (SAV) architectural design pattern to create an application that is easier to maintain and test.

This sample app illustrates the following:

- How structure an application based on the SAV architecture
- How to build isomorphic UI components using Marko and Marko Widgets
- How to render the initial page on the server and render updates to the page in the browser
- How to build isomorphic services
- How to synchronize client-side state with server-side state
- How to build a web server using Express
- How to automatically bundle JS and CSS without a build step using [Lasso.js](https://github.com/lasso-js/lasso)

# Get Started

```bash
git clone https://github.com/raptorjs-samples/todomvc-marko.git
cd todomvc-marko
npm install
node server.js
```

# The SAV Architecture

The <i><b>S</b>tate <b>A</b>pp <b>V</b>iew</i> (SAV) architecture puts emphasis on separating out _application logic_ and _application state_ from the _view_. In addition, the SAV architecture describes how _client-side widgets_ interact with the _application_ to change _application state_. The following diagram illustrates the SAV architecture:

![SAV Architecture Diagram](./docs/sav-achitecture-diagram.png)

The following are characteristics of an application that adopts the SAV architecture:

- An application's view is a pure function of application state
- Application logic and state is completely independent of the view
- Apps are usually singletons (only one instance of the app will be created)
- App instances manage and hold a reference to their application state
- Widgets interact directly with app instances


## The App

With the SAV architecture, the App is like a controller. The App maintains an internal application state object and the App exposes action methods that can be called by Widgets to modify the internal application state. A simplified implementation of the [TodoApp](./src/app/todo/TodoApp.js) is shown below:

```javascript
function TodoApp(state) {
    var self = this;

    // Create a wrapper around the state object to normalize the
    // state and to track changes to the state. The TodoAppState
    // class extends EventEmitter and the "change" event is
    // emitted any time one of the state properties changes.
    this.state = new TodoAppState(state);

    // When the internal state changes also emit a change event on
    // the app and pass along the updated state.
    this.state.on('change', function () {
        self.emit('change', self.state);
    });
}

TodoApp.prototype = {
    /**
     * Change the active todo filter
     * @param {String} filter The enabled filter (either "all", "active" or "completed")
     */
    setFilter: function(filter) {
        // Modify the internal state when the filter changes
        this.state.set('filter', filter);
    },

    setTodoCompleted: function(todoId, completed) {
        var todoCollection = this.state.todoCollection;
        var todo = todoCollection.getTodo(todoId);
        if (todo && todo.completed !== completed) {

            // Modify the existing todo
            todo.completed = completed;

            // Rebuild the todo collection using the updated todo to trigger
            // a state change that will then result in the view being rerendered.
            this.state.set('todoCollection', new TodoCollection(todoCollection.getAllTodos()));

            // Now commit the updated todo to the backend database...
            todoService.updateTodo({
                    todoData: todo
                },
                function(err) {
                    if (err) {
                        // At this point the view may be out-of-sync with the backend.
                        // The correct thing to do here is to resync with the server...
                    }
                });
        }
    }

    // ...
};

// Inherit from EventEmitter so that the app can emit events and other
// objects can subscribe to events:
inherit(TodoApp, require('events').EventEmitter);

module.exports = TodoApp;
```

## The App State

The `TodoApp` maintains an internal state object that is an instance of [TodoAppState](./src/app/todo/TodoAppState.js). The implementation
of [TodoAppState](./src/app/todo/TodoAppState.js) is shown below:

```javascript
var inherit = require('raptor-util/inherit');
var TodoCollection = require('./TodoCollection');

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
     * @param {[type]} name  [description]
     * @param {[type]} value [description]
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
```

## The View

When rendered on the server, the todo app view is given the application state and that includes all the data that is needed to render the todo view. The application state is constructed in the page controller using the following code:

```javascript
todoService.readAllTodos(
    {},
    function(err, result) {
        if (err) {
            return callback(err);
        }

        var appState = new TodoAppState({
            todos: result.todos,
            filter: 'all'
        });

        callback(null, appState);
    });
```

The above code invokes the `readAllTodos(args, callback)` method that is exported by the [todo service](./src/services/todo). Once the todos are asynchronously loaded, an instance of [TodoAppState](./src/app/todo/TodoAppState.js) is created and passed to the view using the provided callback. The state object is passed to the top-level [`<app>`](./src/components/app) UI component using the following code in the [page template](./src/pages/home/template.marko):

```xml
<app state="appState"/>
```

The constructor for [`<app>` widget](./src/components/app/index.js) includes the following code to automatically update the todo view when the application state changes:


```javascript
var todoApp = require('src/app/todo');

module.exports = require('marko-widgets').defineComponent({
    // ...
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
```

# Project Struture

## src/app

## src/components

## src/pages

## src/services

## src/util

# Isomorphic Services

# Server-side Rendering

![Architecture Diagram](./docs/server-side-rendering.png)

# UI Components

## app

## app-header

## app-main

## app-notification

## app-notifications-overlay

## app-todo-item

# UI Pages

## home

# Future Work

- Add support for users
- Make application secure

