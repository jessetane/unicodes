var hg = require('hyperglue2');
var utf8 = require('utf8-transcoder');
var utf16 = require('utf16-transcoder');
var inherits = require('inherits');
var TableView = require('../../lib/table-view');
var PointView = require('../code-point');
var CodePlane = require('../code-plane/model');
var template = require('./template.html');
var scrollTo = require('scroll');

var breakPoints = [
  { start: 0, end: 768, cols: 4, rowHeight: 80 },
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
  if (!this.planes)
    return this.loadPlanes();

  var self = this;
  var hash = window.location.hash.replace(/^#/, '');
  var point = this.selected = Math.abs(parseInt(hash, 16));
  var lastselected = this.el.querySelector('.code-point.selected');
  var nextselected = this.el.querySelector('.code-point a[href="#' + hash + '"]');

  if (lastselected)
    lastselected.classList.remove('selected');
  if (nextselected)
    nextselected.parentNode.classList.add('selected');

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

ChartView.prototype.loadPlanes = function() {
  var self = this;
  CodePlane.search(function(err, planes) {
    if (err) console.error(err);
    self.planes = planes || {};
    self.show();
  });
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
  this.rowCount = Math.ceil(0x10FFFF / this.colCount);
  this.rowHeight = breakPoint.rowHeight;
};

ChartView.prototype.rowAtIndex = function(index) {
  var row = document.createElement('LI');
  row.classList.add('row');
  var cols = this.colCount;
  var colWidth = this.colWidth;
  var i, p, point, firstPoint = index * this.colCount;

  for (i = 0; i < cols; i++) {
    p = firstPoint + i;
    point = new PointView(p);
    if (p === this.selected)
      point.el.classList.add('selected');
    row.appendChild(point.el);
  }

  return row;
};
