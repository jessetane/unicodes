var hg = require('hyperglue2');
var utf8 = require('utf8-transcoder');
var utf16 = require('utf16-transcoder');
var template = require('./template.html');
var CodePoint = require('../code-point/model');
var router = require('uri-router');

module.exports = InfoView;

InfoView.reuse = true;

function InfoView() {
  var self = this;
  var el = this.el = hg(template);

  el.addEventListener('input', this.oninput.bind(this));
  el.addEventListener('click', function(evt) {
    if (evt.target.className === 'close-btn') {
      el.parentNode.classList.remove('show');
      el.parentNode.addEventListener('transitionend', clear);

      function clear() {
        el.parentNode.removeEventListener('transitionend', clear);
        window.location.hash = '';
      }
    }
  });
}

InfoView.prototype.show = function() {
  var hash = window.location.hash.replace(/^#/, '');

  if (hash) {
    this.el.parentNode.classList.add('show');
    router.search({ q: null });
  }
  else {
    this.el.parentNode.classList.remove('show');
  }

  hg(this.el, { '[name=unicode]': { _attr: { value: hash }}});
  this.point = parseInt(hash, 16);
  this.render();
};

InfoView.prototype.oninput = function(evt) {
  console.log('saw input from', evt.target);
};

InfoView.prototype.render = function() {
  var point = this.point;
  var inSurrogateRange = point > 0xD7FF && point < 0xE000;
  var isOutOfBounds = point < 0 || point > 0x10FFFF;
  var els = {
    text: this.el.querySelector('[name=text]'),
    unicode: this.el.querySelector('[name=unicode]'),
    name: this.el.querySelector('.name'),
    plane: this.el.querySelector('.plane'),
    utf8: this.el.querySelector('[name=utf8]'),
    utf16: this.el.querySelector('[name=utf16]'),
    utf16le: this.el.querySelector('[name=utf16le]'),
    utf16be: this.el.querySelector('[name=utf16be]'),
  };

  if (isNaN(this.point) || inSurrogateRange || isOutOfBounds) {
    els.text.value = '';
    els.name.textContent = '';
    els.plane.textContent = '';
    els.utf8.value = '';
    els.utf16.value = '';
  }
  else {
    var doubleOctetUtf16 = utf16.encode(point);
    var codePoint = new CodePoint({ id: point });

    codePoint.read(function(err) {
      if (err) return console.error(err);

      els.text.value = doubleOctetUtf16.reduce(function(string, character) { return string + String.fromCharCode(character) }, '');
      els.name.textContent = codePoint && codePoint.name && codePoint.name.toLowerCase() || '';
      els.plane.textContent = codePoint && codePoint.plane && codePoint.plane.name || '';
      els.utf8.value = utf8.encode(point).map(function(c) { return '0x' + c.toString(16) }).join(' ');
      els.utf16.value = doubleOctetUtf16.map(function(c) { return '0x' + c.toString(16) }).join(' ');
    });
  }
};
