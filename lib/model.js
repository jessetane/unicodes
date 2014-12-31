var merge = require('merge').recursive;
var queue = require('queue');

module.exports = Model;

function Model(attributes) {
  merge(this, attributes);
}

Model.onsearch = function(cb, err, results, total) {
  if (err) return cb && cb(err);

  var q = queue();
  var klass = this;
  var models = {};

  for (i in results) {
    var id = results[i].ref;
    var model = new klass({ id: id });
    models[id] = model;
    q.push(model.read.bind(model));
  }

  q.start(function(err) {
    cb && cb(err, models, total);
  });
};

Model.prototype.onread = function(cb, err, attributes) {
  if (err) return cb && cb(err);

  merge(this, attributes);

  var q = queue();
  var id, name, klass, model, self = this;
  var relationships = this.constructor.relationships;

  for (name in relationships) (function(name) {
    id = self[name];
    if (typeof id !== undefined) {
      klass = relationships[name];
      model = new klass({ id: id });
      self[name] = model;
      q.push(model.read.bind(model));
    }
  })(name);

  q.start(cb);
};
