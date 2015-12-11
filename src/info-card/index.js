var router = require('uri-router')
var render = require('hyperglue2')
var database = require('../database')
var blockFromCodePoint = require('unicode-block-from-code-point')
var stringFromCodePoint = require('../../lib/string-from-code-point')
var utf8FromString = require('../../lib/utf8-from-string')

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
  if (!uri) uri = this._lastUri
  this._lastUri = uri
  var pathname = uri.pathname.slice(1)
  if (pathname) {
    this.codePoint = codePointFromPathname(pathname)
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
      _html: '<a href="/' + codePoint.Block.start.toString(16) + '">' + codePoint.Block.name + '</a>'
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
  var hex = pathname.toUpperCase()
  while (hex.length < 4) hex = '0' + hex
  var codePoint = database.lookup[hex]
  if (codePoint) {
    return codePoint
  } else {
    codePoint = parseInt(pathname, 16)
    return {
      'Code Point': codePoint,
      'Hex String': hex,
      'String': stringFromCodePoint(codePoint),
      'Block': blockFromCodePoint(codePoint)
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
