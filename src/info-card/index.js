var router = require('uri-router')
var render = require('hyperglue2')
var database = require('../database')
var blocks = require('unicode-blocks')
var decodeURI = require('../uri-transcoder').decode
var encodeURI = require('../uri-transcoder').encode
var charFromCodePoint = require('../../lib/char-from-code-point')
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
  this.addEventListener('transitionend', function (evt) {
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
    this.codePoint = codePointFromPathname(pathname)
    this.render()
    this.style.transform = 'translateY(0)'
  } else {
    this.style.transform = ''
  }
}

InfoCard.prototype.render = function () {
  var codePoint = this.codePoint
  if (codePoint) {
    var name = codePoint.Name
    var category = codePoint['General Category']
    var url = encodeURI(codePoint['Code Point'])
    var unicode = codePoint['Code Point'].toString(16).toUpperCase()
    while (unicode.length < 4) unicode = '0' + unicode
    codePoint = {
      '#string #display': codePoint.String,
      '#name': {
        '.field': name,
        _class: {
          hidden: !name
        }
      },
      '#description': {
        '.field': category && category.description,
        _class: {
          hidden: !category
        }
      },
      '#block .field': {
        _html: '<a href="/' + url + '">' + codePoint.Block.name + '</a>'
      },
      '#unicode .field': 'U+' + unicode,
      '#javascript .field': renderJavaScript(codePoint),
      '#utf8 .field': renderUtf8(codePoint)
    }
  } else {
    codePoint = {
      '#string #display': '\uFFFD',
      '.field': ''
    }
  }
  render(this, codePoint)
}

function codePointFromPathname (pathname) {
  var codePoint = decodeURI(pathname)
  var hex = codePoint.toString(16).toUpperCase()
  while (hex.length < 4) hex = '0' + hex
  var data = database.lookup[hex]
  if (data) {
    var name = data['Name']
    if (!name || name.indexOf('<') === 0) {
      name = data['Unicode 1 Name']
      if (name) data['Name'] = name
    }
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
