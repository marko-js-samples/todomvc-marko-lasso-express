TodoMVC - Marko Widgets
==================================

# Overview

This variation of the TodoMVC sample app illustrates a new web application architecture for building high performance, _isomorphic_ webapps using the following technologies:

- [Marko](https://github.com/raptorjs/marko) - View rendering using HTML-based templates
- [Marko Widgets](https://github.com/raptorjs/marko-widgets) - Binding client-side behavior to rendered UI components
- [Lasso.js](https://github.com/lasso-js/lasso) - JavaScript and CSS bundling

For this application we introduce the _State App View_ (SAV) architectural design pattern to create an application that is easier to maintain and test.

# Get Started

```bash
git clone https://github.com/raptorjs-samples/todomvc-marko.git
cd todomvc-marko
npm install
node server.js
```

# The SAV Architecture

The SAV architecture puts emphasis on separating out _application logic_ and _application state_ from the _view_. In addition, the SAV architecture describes how _client-side widgets_ interact with the _application_ to change _application state_. The following diagram illustrates the SAV architecture:

![SAV Architecture Diagram](./docs/sav-achitecture-diagram.png)

The following are characteristics of an application that adopts the SAV architecture:

- An application's view is a pure function of application state
- Application logic and state is completely independent of the view
- Apps are usually singletons (only one instance of the app will be created)
- App instances manage and hold a reference to their application state
- Widgets interact directly with app instances

# Project Structure

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

