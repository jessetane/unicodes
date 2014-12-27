var http = require('http');
var ecstatic = require('ecstatic');

var host = process.env.SERVER_HOST || '::';
var port = process.env.SERVER_PORT || '8080';
var statics = ecstatic(__dirname + '/../share', { cache: 'no-cache', gzip: true });

var server = http.createServer(function(req, res) {
  if (process.env.NODE_ENV !== 'production')
    console.log(req.method + ' ' + req.url);

  statics(req, res, function() {
    req.url = '/';
    statics(req, res);
  });
});

server.listen(port, host, function(err) {
  if (err) return console.error('Failed to start http server:', err);
  console.log('Server listening on ' + port);
});
