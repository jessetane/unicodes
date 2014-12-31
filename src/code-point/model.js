var inherits = require('inherits');

var Model = require('../../lib/model.js');
var Database = require('../database');
var CodePlane = require('../code-plane/model');

var db = new Database({ url: window.location.origin + '/NamesList.txt' });

module.exports = window.CodePoint = CodePoint;

CodePoint.relationships = {
  plane: CodePlane,
};

function CodePoint(attributes) {
  Model.call(this, attributes);
}
inherits(CodePoint, Model);

CodePoint.search = function(query, cb) {
  var self = this;
  db.search('points', query, function(err, results) {
    var total = results.length;
    if (total > 100)
      results = results.slice(0, 100);

    Model.onsearch.call(CodePoint, cb, err, results, total);
  });
};

CodePoint.prototype.read = function(cb) {
  var self = this;
  CodePlane.findByPoint(this.id, function(err, plane) {
    if (err) return cb(err);
    self.plane = plane.id;
    db.read('points', self.id, self.onread.bind(self, cb));
  });
};
