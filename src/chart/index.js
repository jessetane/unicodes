var router = require('uri-router')
var database = require('../database')
var LazyScroll = require('lazy-scroll')
var CodePoint = require('../code-point')
var scrollTo = require('scroll')
var charFromCodePoint = require('../../lib/char-from-code-point')
var codePointFromChar = require('../../lib/code-point-from-char')
var blocks = require('unicode-blocks')
var escapeRegex = require('escape-string-regexp')
var ua = require('../ua')

var styleSheet = document.styleSheets[0]
styleSheet._dynamicStart = styleSheet.cssRules.length

var Chart = {
  prototype: Object.create(LazyScroll.prototype)
}

Chart.prototype.createdCallback = function () {
  LazyScroll.prototype.createdCallback.apply(this, arguments)
  if (ua.safari && !ua.ios) this.deferRemoval = true
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

Chart.prototype.update = function () {
  LazyScroll.prototype.update.call(this)
  if (this._visible.length === 0) return
  var middle = Math.floor(this._visible.length / 2)
  var row = this._visible[middle]
  var block = blocks.fromCodePoint(this.searchQuery ? row.firstCodePoint : row.lastCodePoint)
  if (block !== this.currentBlock) {
    this.currentBlock = block
    this.dispatchEvent(new Event('blockchange'))
  }
}

Chart.prototype.itemAtIndex = function (index) {
  if (!this._rowTemplate) this._generateTemplate()
  var row = this._rowTemplate.cloneNode(true)
  var colCount = this.colCount
  var first = index * colCount
  var col, codePoint, n, c, i = -1
  while (++i < colCount) {
    n = first + i
    if (this.searchQuery) {
      var match = this.searchResults[n]
      n = match && match['Code Point']
    }
    col = row.children[i]
    if (n !== undefined) {
      c = charFromCodePoint(n)
      col.codePoint = n
      col.href = '/' + c
      codePoint = col.firstElementChild
      codePoint.textContent = c
      if (n === this._selection) {
        col.classList.add('selected')
      }
    } else {
      col.classList.add('empty')
    }
  }
  row.firstCodePoint = first
  row.lastCodePoint = first + colCount
  return row
}

Chart.prototype.show = function (uri) {
  if (!uri) uri = router.uri

  var searchQuery = uri.query.search || undefined
  var searchChanged = false
  if (searchQuery && searchQuery !== this.searchQuery) {
    if (database.length) {
      this.searchQuery = searchQuery
      searchChanged = true
    }
    searchQuery = new RegExp(escapeRegex(decodeURIComponent(searchQuery)), 'i')
    this.searchResults = database.filter(function (character) {
      if (searchQuery.test(character.Name)) return true
      if (character.Block) {
        return searchQuery.test(character.Block.name)
      }
    })
  } else if (!searchQuery) {
    delete this.searchQuery
    delete this.searchResults
    searchQuery = true
  }

  var lastItemSize = this.itemSize
  this._size = computeSize(window.innerWidth)
  this.colCount = this._size.cols
  this.itemCount = this.searchResults ? this.searchResults.length : 0x10FFFF
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
    if (selection !== this._selection || searchQuery) {
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
    this.scrollToCodePoint(this._selection)
  } else if (searchChanged) {
    this.scrollTop = 0
    this.dispatchEvent(new Event('searchchange'))
  }
}

Chart.prototype.scrollToCodePoint = function (codePoint) {
  if (this.searchQuery) {
    var i = -1
    while (++i < this.searchResults.length) {
      if (this.searchResults[i]['Code Point'] === codePoint) {
        codePoint = i
        break
      }
    }
    if (i === this.searchResults.length) {
      return
    }
  }
  var rowIndex = Math.floor(codePoint / this.colCount)
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
    scrollTo.top(this, middle, { duration: 350 })
  }
}

function computeSize (size) {
  var r = 1 + size / 320 / 10
  var n = 64 * r
  return {
    cols: Math.ceil(size / n),
    rowHeight: Math.ceil(n),
    fontSize: Math.ceil(26 * r)
  }
}

module.exports = document.registerElement('x-chart', Chart)
