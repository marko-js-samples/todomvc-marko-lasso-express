window.mocha.ui('bdd');
window.mocha.reporter('html');

var chai = require("chai");
var chaiA11y = require("chai-a11y");

chai.use(chaiA11y);