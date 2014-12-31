var inherits = require('inherits');

var Model = require('../../lib/model.js');
var Database = require('../database');

var db = new Database({ url: window.location.origin + '/NamesList.txt' });

module.exports = window.CodePlane = CodePlane;

function CodePlane(attributes) {
  Model.call(this, attributes);
}
inherits(CodePlane, Model);

CodePlane.findByPoint = function(point, cb) {
  db.read('planes', function(err, planes) {
    if (err) return cb(err);

    var i, plane;

    for (i in planes) {
      plane = planes[i];
      if (point >= plane.start &&
          point <= plane.end) {
        break;
      }
    }

    cb(null, plane);
  });
};

CodePlane.search = function(query, cb) {
  if (typeof query === 'function') {
    cb = query;
    db.read('planes', Model.onsearch.bind(CodePlane, cb));
  }
  else {
    db.search('planes', query, Model.onsearch.bind(CodePlane, cb));
  }
};

CodePlane.prototype.read = function(cb) {
  db.read('planes', this.id, this.onread.bind(this, cb));
};
