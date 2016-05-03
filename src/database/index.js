exports = module.exports = []
exports.lookup = {}

var parseUnicodeData = require('unicode-database-parser')
var charFromCodePoint = require('../../lib/char-from-code-point')

var request = new XMLHttpRequest()

request.addEventListener('readystatechange', function (evt) {
  if (request.readyState !== 4) return
  var data = request.response
  var database = module.exports
  var lookup = database.lookup
  data.split('\n').forEach(function (line) {
    if (!line) return
    line = parseUnicodeData(line)
    line['String'] = charFromCodePoint(line['Code Point'])
    lookup[line['Hex String']] = line
    database[database.length] = line
  })
  window.dispatchEvent(new Event('databaseready'))
})

request.open('GET', '/UnicodeData.txt', true)
request.send()
