var hg = require('hyperglue2');
var utf8 = require('utf8-transcoder');
var utf16 = require('utf16-transcoder');
var inherits = require('inherits');
var TableView = require('../../lib/table-view');
var PointView = require('../code-point');
var template = require('./template.html');
var scrollTo = require('scroll');

var breakPoints = [
  { start: 0, end: 768, cols: 3, rowHeight: 120 },
  { start: 768, end: Infinity, cols: 12, rowHeight: 120 },
];

module.exports = ChartView;

ChartView.reuse = true;

function ChartView() {
  this.el = hg(template);
  this.resize = this.resize.bind(this);
  window.addEventListener('resize', this.resize);

  TableView.call(this);
}
inherits(ChartView, TableView);

ChartView.prototype.show = function() {
  var self = this;
  var hash = window.location.hash.replace(/^#/, '');
  var point = this.selection = Math.abs(parseInt(hash, 16));

  this.resize();
  this.update();

  if (hash) {
    var rowIndex = Math.floor(point / this.colCount);
    var style = getComputedStyle(this.scroller);
    var paddingBottom = style.paddingBottom;
    var padding = parseInt(paddingBottom.replace('px', ''));
    var height = this.scroller.offsetHeight - padding;
    var middle = rowIndex * this.rowHeight - height / 2 + this.rowHeight / 2;
    scrollTo.top(this.scroller, middle, { duration: 350 });
  }
};

ChartView.prototype.resize = function(evt) {
  var width = window.innerWidth;
  var breakPoint = null;
  for (var i in breakPoints) {
    breakPoint = breakPoints[i];
    if (width >= breakPoint.start && 
        width < breakPoint.end) {
      break;
    }
  }
  this.colCount = breakPoint.cols;
  this.colWidth = Math.round(this.content.offsetWidth / this.colCount);
  this.rowCount = Math.ceil(0x1FFFF / this.colCount);
  this.rowHeight = breakPoint.rowHeight;
};

ChartView.prototype.rowAtIndex = function(index) {
  var row = document.createElement('LI');
  row.classList.add('row');
  var cols = this.colCount;
  var colWidth = this.colWidth;
  var firstPoint = index * this.colCount;

  for (var i = 0; i < cols; i++) {
    var point = new PointView(firstPoint + i);
    row.appendChild(point.el);
  }

  return row;
};
