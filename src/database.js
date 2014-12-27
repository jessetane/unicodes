var lunr = require('lunr');
var request = require('../lib/request');

var db = null;
var pending = [];

module.exports = function(url, cb) {
  if (db)
    return cb(null, db);

  pending.push(cb);
  if (pending.length > 1) return;

  request(url, function(err, data) {
    if (err)
      return cb && cb(err);

    db = {
      planes: {},
      planes_search: lunr(function() {
        this.ref('id');
        this.field('name');
      }),
      points: {},
      points_search: lunr(function() {
        this.ref('id');
        this.field('name', { boost: 10 });
        this.field('plane');
      }),
    };

    var i = 0;
    var point = 0;
    var plane = 0;
    var id, model, modelPlane, fields, line, lines = data.toString().split('\n');

    for (; i<lines.length; i++) {
      line = lines[i];

      fields = line.match(/^@@\t([0-9A-Fa-f]+)\t(.*)\t([0-9A-Fa-f]+)/);
      if (fields) {
        model = { id: plane, name: fields[2], start: parseInt(fields[1], 16), end: parseInt(fields[3], 16) };
        db.planes[plane++] = model;
        db.planes_search.add(model);
        continue;
      }

      fields = line.match(/^([0-9A-Fa-f]+)\t(.*)/);
      if (fields) {
        id = parseInt(fields[1], 16);
        modelPlane = db.planes[plane - 1];
        model = { id: id, name: fields[2], plane: modelPlane.id };
        db.points[id] = model;
        db.points_search.add({ id: id, name: model.name, plane: modelPlane.name });
      }
    }

    while (pending.length)
      pending.shift()(null, db);
  });
};
