var hg = require('hyperglue2');
var utf8 = require('utf8-transcoder');
var utf16 = require('utf16-transcoder');
var template = require('./template.html');
var CodePoint = require('../code-point/model');
var CodePlane = require('../code-plane/model');

module.exports = FormView;

FormView.reuse = true;

function FormView() {
  var el = this.el = hg(template);
  this.update = this.update.bind(this);
  this.inputs = {
    text: el.querySelector('[name=text]'),
    unicode: el.querySelector('[name=unicode]'),
    name: el.querySelector('[name=name]'),
    plane: el.querySelector('[name=plane]'),
    utf8: el.querySelector('[name=utf8]'),
    utf16: el.querySelector('[name=utf16]'),
    utf16le: el.querySelector('[name=utf16le]'),
    utf16be: el.querySelector('[name=utf16be]'),
  };
}

FormView.prototype.show = function(r) {
  this.router = r;

  if (this.init)
    return this.update();

  this.init = true;
  this.el.addEventListener('input', this.update);
  this.update();
};

FormView.prototype.update = function(evt) {
  var point = null;
  var target = null;

  // url was updated
  if (!evt) {

    // ensure hash has changed
    var hash = window.location.hash.replace(/^#/, '');
    if (hash === this.hash) return;
    this.hash = hash;

    this.inputs.unicode.value = hash;
    target = this.inputs.unicode;
  }

  // input changed
  else {
    target = evt.target;
  }

  // parse code point
  point = parseInput.call(this, target);

  // render
  renderPoint.call(this, point);
};

function parseInput(input) {
  var point = NaN;

  if (input === this.inputs.unicode) {
    point = parseInt(input.value, 16);
  }
  else if (input === this.inputs.utf8) {
    //
  }
  else if (input === this.inputs.utf16) {
    //
  }
  else if (input === this.inputs.utf16le) {
    //
  }

  return point;
}

function renderPoint(point) {
  var self = this;
  var inputs = this.inputs;

  // isNaN
  if (isNaN(point) || point > 0x10FFFF) {
    inputs.text.value = '';
    inputs.name.value = '';
    inputs.plane.value = '';
    inputs.utf8.value = '';
    inputs.utf16.value = '';
    //inputs.utf16le.value = '';
    return;
  }

  // remember hash
  else {
    this.hash = point.toString(16);
  }

  // get models
  var codePoint = CodePoint.get(point);
  var codePlane = CodePlane.get(codePoint.plane);

  // we use this in two places
  var doubleOctetUtf16 = utf16.encode(point);

  // render
  inputs.text.value = doubleOctetUtf16.reduce(function(b, next) { return b += String.fromCharCode(next) }, '');

  // do these in next tick
  process.nextTick(function() {
    inputs.name.value = codePoint && codePoint.name || '';
    inputs.plane.value = codePlane && codePlane.name || '';
    inputs.utf8.value = utf8.encode(point).map(function(c) { return '0x' + c.toString(16) }).join(' ');
    inputs.utf16.value = doubleOctetUtf16.map(function(c) { return '0x' + c.toString(16) }).join(' ');
    //inputs.utf16le.value = utf16.encode(point, { LE: true }).map(function(c) { return '0x' + c.toString(16) }).join(' ');

    // update location
    window.location.hash = '#' + self.hash;
  });
}
