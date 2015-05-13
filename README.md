TodoMVC - Marko Widgets
==================================

# Overview

This variation of the TodoMVC sample app illustrates a new web application architecture for building high performance, _isomorphic_ webapps using the following technologies:

- [Marko](https://github.com/raptorjs/marko) - View rendering using HTML-based templates
- [Marko Widgets](https://github.com/raptorjs/marko-widgets) - Binding client-side behavior to rendered UI components
- [Lasso.js](https://github.com/lasso-js/lasso) - JavaScript and CSS bundling

For this application we introduce the <i><b>S</b>tate <b>A</b>pp <b>V</b>iew</i> (SAV) architectural design pattern to create an application that is easier to maintain and test.

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

With the SAV architecture, the App is like a controller. The App maintains an internal application state object and the App exposes action methods that can be called by Widgets to modify the internal application state. A simplified Todo App implementation is shown below:

```javascript
function TodoApp(state) {
    var self = this;

    this.state = new TodoAppState(state);

    // When the internal state changes also emit a change event on
    // the app and pass along the updated state.
    this.state.on('change', function () {
        self.emit('change', self.state);
    });
}

TodoApp.prototype = {
    setFilter: function(filter) {
        this.state.set('filter', filter);
    },

    setTodoCompleted: function(todoId, completed) {
        var todoCollection = this.state.todoCollection;
        var todo = todoCollection.getTodo(todoId);
        if (todo && todo.completed !== completed) {

            // Modify the existing todo
            todo.completed = completed;

            // Rebuild the todo collection using the updated todo to trigger
            // a state change that will then result in the view being rerendered
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

TODO

## The View

When rendered on the server, the view is given the application state. On the client, when the top-level application widget initializes it should add a listener to the `change` event on the app.


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

