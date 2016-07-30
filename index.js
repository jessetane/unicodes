// shims
require('document-register-element')
require('./src/ua')

// custom elements
require('./src/chart')
require('./src/search')
require('./src/info-card')
require('./src/blocks')

var router = require('uri-router')

var elements = [
  document.querySelector('x-chart'),
  document.querySelector('x-search'),
  document.querySelector('x-info-card')
]

router({
  routes: [
    ['.*', function (uri) {
      elements.forEach(function (el) {
        el.show(uri)
      })
    }]
  ]
})
