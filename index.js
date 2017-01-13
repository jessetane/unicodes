// shims
require('document-register-element')
require('./src/ua')

// analytics
var gaid = process.env.GOOGLE_ANALYTICS
window.GoogleAnalyticsObject = 'GoogleAnalytics'
window.GoogleAnalytics = function () {
  window.GoogleAnalytics.q.push(arguments)
}
GoogleAnalytics.q = []
GoogleAnalytics.l = 1 * new Date()
GoogleAnalytics('create', gaid, 'auto')
if (gaid) {
  var script = document.createElement('script')
  script.async = 1
  script.src = 'https://www.google-analytics.com/analytics.js';
  document.body.appendChild(script)
}

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
        GoogleAnalytics('send', 'pageview')
      })
    }]
  ]
})
