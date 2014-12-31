var hg = require('hyperglue2');
var router = require('uri-router');
var template = require('./template.html');

module.exports = SearchInput;

SearchInput.reuse = true;

function SearchInput() {
  this.el = hg(template);
  this.onsearch = this.onsearch.bind(this);
  this.el.addEventListener('input', this.onsearch);
  this.input = this.el.querySelector('input');
}

SearchInput.prototype.show = function(r) {
  var query = r.location.query.q || '';

  if (this.input.value !== query) {
    this.input.value = query;
  }
};

SearchInput.prototype.onsearch = function(evt) {
  var query = this.input.value;
  window.location.hash = '';
  router.search({ q: query });
};
