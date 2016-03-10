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
  this.addEventListener('change', onselect.bind(this))
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
      selection.selected = false
      selection.removeAttribute('selected')
    }
    if (currentBlock) {
      selection = this.querySelector('[value="' + currentBlock.name + '"]')
      selection.selected = true
      selection.setAttribute('selected', 'selected')
    }
    return
  }
  render(this, {
    _attr: {
      style: self === top ? null : 'pointer-events:none;'
    },
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

function onselect (evt) {
  var codePoint = null
  var selection = this.select.value
  if (chart.searchResults) {
    codePoint = chart.searchResults.reduce(function (p, n) {
      return !p && n.Block.name === selection ? n['Code Point'] : p
    }, null)
  } else {
    codePoint = blocks.reduce(function (p, n) {
      return n.name === selection ? n.start : p
    }, null)
  }
  chart.scrollToCodePoint(codePoint)
}

module.exports = document.registerElement('x-blocks', Blocks)
