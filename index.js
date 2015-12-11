// shims & hax
require('document-register-element')
require('fastclick')(document.body)
require('./src/ua')

// custom elements
require('./src/chart')
require('./src/search')
require('./src/info-card')

var router = require('uri-router')

var elements = [
  document.querySelector('x-chart'),
  document.querySelector('x-search'),
  document.querySelector('x-info-card')
]

router({
  watch: 'pathname',
  routes: [
    ['.*', function (uri) {
      elements.forEach(function (el) {
        el.show(uri)
      })
    }]
  ]
})
