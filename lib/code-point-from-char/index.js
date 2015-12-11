// browser support isn't quite there for codePointAt()
module.exports = function (c) {
  var s = c.charCodeAt(0)
  if (s > 0xD7FF && s < 0xE000) {
    return (s - 0xD800 << 10 | c.charCodeAt(1) - 0xDC00) + 0x10000
  }
  return s
}
