var HashArray = require('./hash-array');

module.exports = Pool;

function Pool(opts) {
  opts = opts || {};

  this.klass = opts.klass || Object;
  this.max = opts.max || 1000;
  this.inpool = new HashArray;
  this.outpool = new HashArray;
}

Object.defineProperty(HashArray.prototype, 'size', {
  enumerable: false,
  get: function() {
    return this.inpool.length + this.outpool.length;
  }
});

Pool.prototype.catch = function() {
  var inpool = this.inpool;
  var outpool = this.outpool;
  var id, thing = null;

  if (inpool.length) {
    thing = inpool.pop();
    id = outpool.push(thing);
  }
  else if (this.size < this.max) {
    thing = new this.klass;
    id = outpool.push(thing);
  }

  if (thing) {
    thing._poolid = id;
  }

  return thing;
};

Pool.prototype.release = function(thing) {
  var inpool = this.inpool;
  var outpool = this.outpool;

  if (!thing || !outpool[thing._poolid])
    return;

  delete outpool[thing._poolid];
  inpool.push(thing);
};
