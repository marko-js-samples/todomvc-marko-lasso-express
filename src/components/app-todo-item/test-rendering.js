'use strict';
var expect = require('chai').expect;
var appTodoItem = require('./index');
var cheerio = require('cheerio');

it('render a todo item that is pending', function() {

    var html = appTodoItem.render({
            todoData: {
                title: 'Test todo',
                pending: true
            },
            isEditing: false,
            editingTitle: null
        }).toString();

    var $ = cheerio.load(html);
    expect($('label').text()).to.equal('Test todo');
    expect($('li').attr('class')).to.contain('pending');
});