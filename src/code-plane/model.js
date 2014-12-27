var lunr = require('lunr');
var queue = require('queue');
var merge = require('merge').recursive;
var request = require('../../lib/request');
var database = require('../database');

module.exports = window.CodePlane = CodePlane;

var cache = CodePlane.cache = {
  collection: null,
  search: null,
};

function CodePlane(instance) {
  merge(this, instance);
}

CodePlane.get = function(id) {
  return cache.collection[id];
};

CodePlane.read = function(cb) {
  if (cache.collection)
    return cb && cb(null, cache.collection);

  var q = queue();
  q.push(getPlanes);
  q.push(getSearch);
  // q.push(readPlanes);
  // q.push(readSearch);
  q.start(function(err) {
    if (err)
      return cb && cb(err);

    cb && cb(null, cache.collection);
  });
};

function getPlanes(cb) {
  database(window.location.origin + '/NamesList.txt', function(err, db) {
    if (err) return cb(err);
    cache.collection = db.planes;
    cb();
  });
}

function getSearch(cb) {
  database(window.location.origin + '/NamesList.txt', function(err, db) {
    if (err) return cb(err);
    cache.search = db.planes_search;
    cb();
  });
}

function readPlanes(cb) {
  request(window.location.origin + '/database/planes.json', function(err, data) {
    if (err)
      return cb(err);

    var i = null;
    var plane = null;
    var planes = JSON.parse(data);

    cache.collection = {};

    for (i in planes) {
      plane = planes[i];
      cache.collection[plane.id] = new CodePlane(plane);
    }

    cb();
  });
}

function readSearch(cb) {
  request(window.location.origin + '/database/planes-search.json', function(err, data) {
    if (err)
      return cb(err);

    cache.search = lunr.Index.load(JSON.parse(data.toString()));
    cb();
  });
}

CodePlane.search = function(query, cb) {
  CodePlane.read(function(err) {
    if (err)
      return cb && cb(err);

    var results = cache.search.search(query)
      .map(function(result) {
        return cache.collection[result.ref];
      });

    cb && cb(null, results);
  });
};

CodePlane.prototype.read = function(cb) {
  var self = this;
  CodePlane.read(function(err) {
    if (err)
      return cb && cb(err);

    merge(self, cache.collection[self.id]);
    cb && cb(null, self);
  });
};
