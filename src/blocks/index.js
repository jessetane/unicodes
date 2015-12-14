var router = require('uri-router')
var render = require('hyperglue2')
var blocks = require('unicode-blocks')

var chart = document.querySelector('x-chart')

var Blocks = {
  prototype: Object.create(HTMLElement.prototype)
}

Blocks.prototype.createdCallback = function () {
  this.innerHTML = require('./index.html')
  this.select = this.querySelector('select')
  this.visible = blocks
  this.addEventListener('change', onchange.bind(this))
  chart.addEventListener('blockchange', this.show.bind(this))
  chart.addEventListener('searchchange', this.show.bind(this))
}

Blocks.prototype.show = function () {
  var currentBlock = chart.currentBlock
  if (this.searchResults !== chart.searchResults) {
    this.searchResults = chart.searchResults
    this._computeVisibleBlocks()
  } else if (this.select.children.length > 1) {
    var selection = this.querySelector('[selected]')
    if (selection) {
      selection.removeAttribute('selected')
    }
    if (currentBlock) {
      var selection = this.querySelector('[value="' + currentBlock.name + '"]')
      selection.setAttribute('selected', 'selected')
    }
    return
  }
  render(this, {
    'option': this.visible.map(function (block) {
      return {
        _text: block.name,
        _value: block.name,
        _attr: {
          selected: block === currentBlock ? 'selected' : null
        }
      }
    })
  })
}

Blocks.prototype._computeVisibleBlocks = function () {
  if (chart.searchResults) {
    var visible = this.visible = []
    var dedupe = {}
    chart.searchResults.forEach(function (codePoint) {
      var block = codePoint.Block
      if (!dedupe[block.name]) {
        dedupe[block.name] = true
        visible[visible.length] = block
      }
    })
  } else {
    this.visible = blocks
  }
}

function onchange (evt) {
  var codePoint = null
  var selection = this.select.value
  if (chart.searchResults) {
    chart.searchResults.forEach(function (cp) {
      if (codePoint === null && cp.Block.name === selection) {
        codePoint = cp['Code Point']
      }
    })
  } else {
    codePoint = blocks.reduce(function (p, n) {
      return n.name === selection ? n : p
    }, null).start
  }
  chart.scrollToCodePoint(codePoint)
}

module.exports = document.registerElement('x-blocks', Blocks)
