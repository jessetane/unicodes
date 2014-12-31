var router = require('uri-router');
var fc = require('fastclick');

fc(document.body);

router({
  watch: 'hash',
  outlet: '.chart',
  routes: { '.*': require('./chart') }
});

router({
  watch: 'search',
  outlet: '.search-results',
  routes: { '.*': require('./search-results') }
});

router({
  watch: 'hash',
  outlet: '.info',
  routes: { '.*': require('./info') }
});

router({
  watch: 'search',
  outlet: '.search-input',
  routes: { '.*': require('./search-input') }
});
