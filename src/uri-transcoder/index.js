var charFromCodePoint = require('../../lib/char-from-code-point')
var codePointFromChar = require('../../lib/code-point-from-char')

exports.encode = function (codePoint, string) {
  if (codePoint === 0) {
    return 'NULL'
  } else if (codePoint > 0xD7FF && codePoint < 0xE000) {
    return 'surrogate-' + codePoint.toString(16).toUpperCase()
  } else if (!string) {
    string = charFromCodePoint(codePoint)
  }
  return encodeURIComponent(string)
}

exports.decode = function (uri) {
  if (uri.indexOf('surrogate') === 0) {
    return parseInt(uri.split('-')[1], 16)
  } else {
    if (uri === 'NULL') uri = '\x00'
    else uri = decodeURIComponent(uri)
    return codePointFromChar(uri)
  }
}
