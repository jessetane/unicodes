// for whatever reason String.fromCodePoint is super slow
module.exports = function (codePoint) {
  if (codePoint > 0xFFFF) {
    codePoint -= 0x10000
    var surrogate = codePoint >>> 10 & 0x3FF | 0xD800
    codePoint = 0xDC00 | codePoint & 0x3FF
    return String.fromCharCode(surrogate) + String.fromCharCode(codePoint)
  }
  return String.fromCharCode(codePoint)
}
