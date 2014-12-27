var lunr = require('lunr');
var queue = require('queue');
var merge = require('merge').recursive;
var request = require('../../lib/request');
var database = require('../database');
var CodePlane = require('../code-plane/model');

module.exports = window.CodePoint = CodePoint;

var cache = CodePoint.cache = {
  collection: null,
  search: null,
};

function CodePoint(instance) {
  merge(this, instance);
}

CodePoint.get = function(id) {
  return cache.collection[id];
};

CodePoint.read = function(cb) {
  if (cache.collection)
    return cb && cb(null, cache.collection);

  var q = queue();
  q.push(CodePlane.read);
  q.push(getPoints);
  q.push(getSearch);
  // q.push(readPoints);
  // q.push(readSearch);
  q.start(function(err) {
    if (err)
      return cb && cb(err);

    cb && cb(null, cache.collection);
  });
};

function getPoints(cb) {
  database(window.location.origin + '/NamesList.txt', function(err, db) {
    if (err) return cb(err);
    cache.collection = db.points;
    cb();
  });
}

function getSearch(cb) {
  database(window.location.origin + '/NamesList.txt', function(err, db) {
    if (err) return cb(err);
    cache.search = db.points_search;
    cb();
  });
}

function readPoints(cb) {
  request(window.location.origin + '/database/points.json', function(err, data) {
    if (err)
      return cb(err);

    var i = null;
    var point = null;
    var points = JSON.parse(data);
    
    cache.collection = {};

    for (i in points) {
      point = points[i];
      cache.collection[point.id] = new CodePoint(point);
    }
    
    cb();
  });
}

function readSearch(cb) {
  request(window.location.origin + '/database/points-search.json', function(err, data) {
    if (err)
      return cb(err);
    
    cache.search = lunr.Index.load(JSON.parse(data.toString()));
    cb();
  });
}

CodePoint.search = function(query, cb) {
  CodePoint.read(function(err) {
    if (err)
      return cb && cb(err);

    var results = cache.search.search(query)
      .map(function(result) {
        return cache.collection[result.ref];
      });

    cb && cb(null, results);
  });
};

CodePoint.prototype.read = function(cb) {
  var self = this;
  CodePoint.read(function(err) {
    if (err)
      return cb && cb(err);

    merge(self, cache.collection[self.id]);
    cb && cb(null, self);
  });
};
