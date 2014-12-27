var hyperquest = require('hyperquest');
var concat = require('concat-stream');

module.exports = Request;

function Request(url, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts;
    opts = {};
  }
  opts = opts || {};

  var req = hyperquest(url, opts);
  var res = null;

  req.on('error', function(err) {
    cb && cb(err);
  });

  req.pipe(concat(function(data) {
    res = req.response;

    if (res.statusCode < 200 || res.satusCode > 299) {
      var err = new Error(data || 'Not ok');
      err.code = res.statusCode;
      return cb && cb(err);
    }

    cb && cb(err, data);
  }));

  return req;
}
