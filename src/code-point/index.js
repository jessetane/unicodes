var hg = require('hyperglue2');
var utf16 = require('utf16-transcoder');
var template = require('./template.html');

module.exports = CodePointView;

function CodePointView(i) {
  var hex = i.toString(16);
  var units = [];
  var string = '';

  if (i < 0xD800 || i > 0xDFFF) {
    units = utf16.encode(i);
  }
  
  for (var n = 0; n < units.length; n++) {
    string += String.fromCharCode(units[n]);
  }
  
  var tmp = document.createElement('div');
  tmp.innerHTML = '<div class="code-point"><a href="#' + hex + '"><div>' + string + '</div></a></div>';
  this.el = tmp.firstChild;
}
