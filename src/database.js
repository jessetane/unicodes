var lunr = require('lunr');
var merge = require('merge').recursive;
var request = require('../lib/request');
var localStorage = require('localforage');

localStorage.config({ size: 1024 * 1024 * 15 });

var db = null;
var pending = [];

module.exports = Database;

function Database(props) {
  merge(this, props);
}

Database.prototype.search = function(table, query, cb) {
  this._fetch(function(err) {
    if (err) return cb(err);

    cb(null, db[table].index.search(query));
  });
};

Database.prototype.read = function(table, id, cb) {
  this._fetch(function(err) {
    if (typeof cb !== 'function') {
      cb = id;
      id = null;
    }

    if (err) return cb(err);

    var rows = db[table].rows;
    var ret = id === null ? rows : rows[id];

    cb(null, ret);
  });
};

Database.prototype._fetch = function(cb) {
  if (db) return cb();

  pending.push(cb);
  if (pending.length > 1) return;

  var self = this;
  tryLocalStorage.call(self, function(err) {
    if (!err) return done();
    tryHTTP.call(self, done);
  });

  function done(err) {
    while (pending.length)
      pending.shift()(err);
  }
};

function tryLocalStorage(cb) {
  localStorage.getItem('cache', function(err, data) {
    if (err) return cb(err);

    try {
      var tmp = JSON.parse(data);
      tmp.planes.index = lunr.Index.load(tmp.planes.index);
      tmp.points.index = lunr.Index.load(tmp.points.index);
      db = tmp;
    }
    catch (err) {
      return cb(err);
    }

    cb(err);
  });
}

function tryHTTP(cb) {
  request(this.url, function(err, data) {
    if (err) return cb(err);

    var tmp = {
      planes: {
        rows: {},
        index: lunr(function() {
          this.ref('id');
          this.field('name');
        }),
      },
      points: {
        rows: {},
        index: lunr(function() {
          this.ref('id');
          this.field('name', { boost: 10 });
          this.field('plane');
        }),
      },
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
        tmp.planes.rows[plane++] = model;
        tmp.planes.index.add(model);
        continue;
      }

      fields = line.match(/^([0-9A-Fa-f]+)\t(.*)/);
      if (fields) {
        id = parseInt(fields[1], 16);
        modelPlane = tmp.planes.rows[plane - 1];
        model = { id: id, name: fields[2], plane: modelPlane.id };
        tmp.points.rows[id] = model;
        tmp.points.index.add({ id: id, name: model.name, plane: modelPlane.name });
      }
    }

    var toCache = JSON.stringify(tmp);
    localStorage.setItem('cache', toCache, function(err) {
      if (err) return cb(err);
      db = tmp;
      cb();
    });
  });
};
