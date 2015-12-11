var router = require('uri-router')
var database = require('../database')
var LazyScroll = require('lazy-scroll')
var CodePoint = require('../code-point')
var scrollTo = require('scroll')
var charFromCodePoint = require('../../lib/char-from-code-point')
var codePointFromChar = require('../../lib/code-point-from-char')
var escapeRegex = require('escape-string-regexp')
var ua = require('../ua')

var styleSheet = document.styleSheets[0]
styleSheet._dynamicStart = styleSheet.cssRules.length

var Chart = {
  prototype: Object.create(LazyScroll.prototype)
}

Chart.prototype.createdCallback = function () {
  LazyScroll.prototype.createdCallback.apply(this, arguments)
  document.body.classList.remove('loading')
  window.addEventListener('databaseready', this.show.bind(this, null))
  window.addEventListener('resize', this._onresize.bind(this))
  this.addEventListener('click', function (evt) {
    if (evt.target.href) {
      evt.preventDefault()
      router.push(evt.target.pathname + window.location.search)
    }
  })
}

Chart.prototype._onresize = function () {
  delete this._rowTemplate
  this.show()
}

Chart.prototype._generateTemplate = function () {
  var row = this._rowTemplate = document.createElement('DIV')
  row.classList.add('row')
  var col, codePoint, i = -1
  while (++i < this.colCount) {
    col = document.createElement('A')
    col.classList.add('col')
    codePoint = new CodePoint()
    col.appendChild(codePoint)
    row.appendChild(col)
  }
}

Chart.prototype.itemAtIndex = function (index) {
  if (!this._rowTemplate) this._generateTemplate()
  var row = this._rowTemplate.cloneNode(true)
  var first = index * this.colCount
  var col, codePoint, n, c, i = -1
  while (++i < this.colCount) {
    n = first + i
    if (this._filter) {
      var match = this._filtered[n]
      n = match && match['Code Point']
    }
    if (n !== undefined) {
      c = charFromCodePoint(n)
      col = row.children[i]
      col.href = '/' + c
      codePoint = col.firstElementChild
      codePoint.textContent = c
      if (n === this._selection) {
        col.classList.add('selected')
      }
    }
  }
  return row
}

Chart.prototype.show = function (uri) {
  if (!uri) uri = this._lastUri
  this._lastUri = uri

  var filter = uri.query.filter || undefined
  if (filter && filter !== this._filter) {
    if (database.length) this._filter = filter
    filter = new RegExp(escapeRegex(filter), 'i')
    this._filtered = database.filter(function (character) {
      return !!filter.test(character.Name) || filter.test(character.Block && character.Block.name)
    })
  } else if (!filter) {
    delete this._filter
    delete this._filtered
    filter = true
  }

  var lastItemSize = this.itemSize
  this._size = computeSize(window.innerWidth)
  this.colCount = this._size.cols
  this.itemCount = this._filtered ? this._filtered.length : 0x10FFFF
  this.itemCount = Math.ceil(this.itemCount / this.colCount)
  this.itemSize = this._size.rowHeight

  if (this.itemSize !== lastItemSize) {
    while (styleSheet.cssRules.length > styleSheet._dynamicStart) {
      styleSheet.deleteRule(styleSheet.cssRules.length - 1)
    }
    styleSheet.insertRule('x-chart .row { height: ' + this._size.rowHeight + 'px }', styleSheet.cssRules.length)
    if (ua.ios) {
      styleSheet.insertRule('x-code-point { transform: scale(' + this._size.fontSize / 16 + ') }', styleSheet.cssRules.length)
    } else {
      styleSheet.insertRule('x-code-point { font-size: ' + this._size.fontSize + 'px }', styleSheet.cssRules.length)
    }
  }

  var selection = uri.pathname.slice(1) || undefined
  if (selection) {
    selection = codePointFromChar(decodeURIComponent(selection))
    if (selection !== this._selection || filter) {
      this._selection = selection
      selection = true
    } else {
      selection = false
    }
  } else {
    delete this._selection
  }

  this.clear()
  this.update()
  if (selection) {
    this._scrollToSelection()
  } else if (this._filter) {
    this.scrollTop = 0
  }
}

Chart.prototype._scrollToSelection = function () {
  var selection = this._selection
  if (this._filter) {
    var i = -1
    while (++i < this._filtered.length) {
      if (this._filtered[i]['Code Point'] === selection) {
        selection = i
        break
      }
    }
    if (i === this._filtered.length) {
      return
    }
  }
  var rowIndex = Math.floor(selection / this.colCount)
  var style = window.getComputedStyle(this)
  var paddingBottom = style.paddingBottom
  var padding = parseInt(paddingBottom.replace('px', ''), 10)
  var height = this.offsetHeight - padding
  var middle = Math.round(rowIndex * this.itemSize - height / 2 + this.itemSize / 2)
  if (this.scrollTop === middle) {
    this.scrollTop = middle
  } else {
    if (Math.abs(middle - this.scrollTop) > 1000) {
      this.scrollTop = this.scrollTop < middle ? middle - 1000 : middle + 1000
    }
    this._scrollTop = middle
    scrollTo.top(this, middle, { duration: 350 }, function () {
      this._scrollTop = this.scrollTop
    }.bind(this))
  }
}

Chart.prototype.rectForCodePoint = function (codePoint) {
  var size = this.itemSize
  var colCount = this.colCount
  var row = ~~(codePoint / colCount)
  var col = codePoint % colCount
  var top = row * size - this.scrollTop
  var width = this.offsetWidth / colCount
  var left = col * width
  return {
    top: top,
    bottom: top + size,
    left: left,
    right: left + width,
    width: width,
    height: size
  }
}

function computeSize (size) {
  // magic numberz
  var r = 1 + size / 320 / 10
  var n = 64 * r
  return {
    cols: Math.ceil(size / n),
    rowHeight: Math.ceil(n),
    fontSize: Math.ceil(26 * r)
  }
}

module.exports = document.registerElement('x-chart', Chart)
