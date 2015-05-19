'use strict';
var expect = require('chai').expect;
var appTodoItem = require('./index');

describe(module.id, function() {
    it('should support pending', function() {
        var widget = appTodoItem.render({
                todoData: {
                    title: 'Test todo',
                    pending: true
                },
                isEditing: false,
                editingTitle: null
            })
            .appendTo(document.getElementById('test'))
            .getWidget();

        var titleEl = widget.el.querySelector("label");
        expect(titleEl.innerHTML).to.equal('Test todo');
        expect(widget.el.className).to.contain('pending');
        expect(widget.state.isPending).to.equal(true);
    });

    it('should be accessible', function() {
        var widget = appTodoItem.render({
                todoData: {
                    title: 'Test todo'
                },
                isEditing: false,
                editingTitle: null
            })
            .appendTo(document.getElementById('test'))
            .getWidget();

        return expect(widget.el).to.be.accessible();
    });
});
