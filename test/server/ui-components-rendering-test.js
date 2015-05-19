'use strict';
var nodePath = require('path');

require('app-module-path').addPath(nodePath.join(__dirname, '../../'));

var chai = require('chai');
chai.config.includeStack = true;
require('chai').should();

var fs = require('fs');

var componentsDir = nodePath.join(__dirname, '../../src/components');

describe('ui-components-rendering', function() {
    // Now load all of the test.js files under src/components
    fs.readdirSync(componentsDir).forEach(function(dir) {

        var testsPath = nodePath.join(componentsDir, dir, 'test-rendering.js');
        if (fs.existsSync(testsPath)) {
            describe(dir + ' rendering', function() {
                require(testsPath);
            });
        } else {
            // console.warn('WARN: Rendering tests missing for ' + componentsDir);
        }
    });
});