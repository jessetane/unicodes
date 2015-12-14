var router = require('uri-router')
var render = require('hyperglue2')
var database = require('../database')
var blocks = require('unicode-blocks')
var charFromCodePoint = require('../../lib/char-from-code-point')
var codePointFromChar = require('../../lib/code-point-from-char')
var utf8FromString = require('../../lib/utf8-from-string')
var ua = require('../ua')

var InfoCard = {
  prototype: Object.create(HTMLElement.prototype)
}

InfoCard.prototype.createdCallback = function () {
  this.innerHTML = require('./index.html')
  this.style.transform = 'translateY(' + document.body.offsetHeight + 'px)'
  this.classList.remove('hidden')
  this.addEventListener('click', function (evt) {
    if (evt.target.id === 'close') {
      router.push('/' + window.location.search)
    }
  })
  if (ua.ios) {
    // workaround for buggy selection on ios
    var display = this.querySelector('#string #display')
    display.addEventListener('touchend', function (evt) {
      setTimeout(function () {
        var s = window.getSelection()
        var r = document.createRange()
        r.setStart(display.firstChild, 0)
        r.setEnd(display.firstChild, 1)
        s.removeAllRanges()
        s.addRange(r)
      }, 100)
    })
  }
  document.body.addEventListener('transitionend', function (evt) {
    if (evt.target !== this) return
    if (window.location.pathname === '/') {
      delete this.codePoint
      this.querySelector('#scroller').scrollTop = 0
      this.render()
    }
  }.bind(this))
  window.addEventListener('databaseready', this.show.bind(this, null))
}

InfoCard.prototype.show = function (uri) {
  if (!uri) uri = router.uri
  var pathname = uri.pathname.slice(1)
  if (pathname) {
    pathname = decodeURIComponent(pathname)
    this.codePoint = codePointFromPathname(pathname)
    if (this.codePoint.String !== pathname) {
      router.push('/' + this.codePoint.String, true)
      return
    }
    this.render()
    this.style.transform = 'translateY(0)'
  } else {
    this.style.transform = ''
  }
}

InfoCard.prototype.render = function () {
  var codePoint = this.codePoint
  render(this, codePoint ? {
    '#string #display': codePoint.String,
    '#name': codePoint.Name || '',
    '#block': {
      _html: '<a href="/' + charFromCodePoint(codePoint.Block.start) + '">' + codePoint.Block.name + '</a>'
    },
    '#unicode': '0x' + codePoint['Code Point'].toString(16).toUpperCase(),
    '#javascript': renderJavaScript(codePoint),
    '#utf8': renderUtf8(codePoint)
  } : {
    '.field': '',
    '#string #display': '?'
  })
}

function codePointFromPathname (pathname) {
  var codePoint = codePointFromChar(pathname)
  var hex = codePoint.toString(16).toUpperCase()
  while (hex.length < 4) hex = '0' + hex
  var data = database.lookup[hex]
  if (data) {
    return data
  } else {
    return {
      'Code Point': codePoint,
      'Hex String': hex,
      'String': charFromCodePoint(codePoint),
      'Block': blocks.fromCodePoint(codePoint)
    }
  }
}

function renderJavaScript (codePoint) {
  var surrogates = codePoint.String.split('')
  return surrogates.map(function (s) {
    return '0x' + s.charCodeAt(0).toString(16).toUpperCase()
  }).join(' ')
}

function renderUtf8 (codePoint) {
  var bytes = utf8FromString(codePoint.String)
  return bytes.map(function (b) {
    return '0x' + b.toString(16).toUpperCase()
  }).join(' ')
}

module.exports = document.registerElement('x-info-card', InfoCard)
