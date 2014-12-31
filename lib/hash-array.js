module.exports = HashArray;

function HashArray() {}

Object.defineProperty(HashArray.prototype, 'length', {
  enumerable: false,
  get: function() {
    return Object.keys(this).length;
  }
});

HashArray.prototype.push = function(value) {
  var key = genkey.call(this);
  this[key] = value;
  return key;
};

HashArray.prototype.pop = function() {
  var keys = Object.keys(this);
  var value, key = keys.pop();
  if (key !== undefined) {
    value = this[key];
    delete this[key];
    return value;
  }
};

function genkey() {
  var key = null;
  
  while (this[key]) 
    key = Math.random();

  return key;
}
