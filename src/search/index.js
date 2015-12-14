var router = require('uri-router')
var ua = require('../ua')

var Search = {
  prototype: Object.create(HTMLElement.prototype)
}

if (ua.touch) {
  window.addEventListener('scroll', function (evt) {
    var isFocused = document.documentElement.classList.contains('focused')
    if (!isFocused) return
    var hasFix = document.documentElement.style.height
    if (hasFix) {
      document.body.scrollTop = 0
    } else {
      var keyboardHeight = document.body.scrollTop
      if (ua.ios && ua.small) {
        // attempt to detect iphones which add some extra space
        keyboardHeight -= window.innerHeight * 0.017708333333333333
      }
      document.documentElement.style.height = 'calc(100% - ' + keyboardHeight + 'px)'
      document.body.scrollTop = 0
    }
  })
}

Search.prototype.createdCallback = function () {
  this.innerHTML = require('./index.html')
  var input = this.input = this.querySelector('input')
  if (ua.touch) {
    // on touch screens we need to do backflips
    // to work around the software keyboard
    input.addEventListener('focus', function (evt) {
      document.documentElement.classList.add('focused')
    })
    input.addEventListener('blur', function () {
      document.documentElement.classList.remove('focused')
      document.documentElement.style.height = ''
      document.body.scrollTop = 0
      setTimeout(function () {
        window.dispatchEvent(new Event('resize'))
      })
    })
  }
  input.addEventListener('input', function () {
    router.search({
      search: encodeURIComponent(input.value)
    })
  })
  input.addEventListener('keyup', function (evt) {
    if (evt.keyCode === 13) {
      input.blur()
    }
  })
  this.searchResults = this.querySelector('x-search-results')
}

Search.prototype.show = function (uri) {
  var search = decodeURIComponent(uri.query.search || '')
  if (this.input.value !== search) this.input.value = search || ''
}

module.exports = document.registerElement('x-search', Search)
