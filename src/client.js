var router = require('uri-router');
var CodePoint = require('./code-point/model');

var t = performance.now();
CodePoint.read(function(err) {
  console.log('~~~', performance.now() - t);

  if (err)
    console.warn(err);

  router({
    watch: 'hash',
    outlet: '.form',
    routes: { '.*': require('./form') }
  });

  router({
    watch: 'hash',
    outlet: '.chart',
    routes: { '.*': require('./chart') }
  });
});
