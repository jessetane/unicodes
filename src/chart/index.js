var hg = require('hyperglue2');
var utf8 = require('utf8-transcoder');
var utf16 = require('utf16-transcoder');
var template = require('./template.html');

var breakPoints = [
  { start: 0, end: 768, cols: 3, rowHeight: 78 },
  { start: 768, end: Infinity, cols: 8, rowHeight: 118 },
];

module.exports = ChartView;

ChartView.reuse = true;

function ChartView() {
  this.el = hg(template);
  this.resize = this.resize.bind(this);
  this.scroll = this.scroll.bind(this);
  this.update = this.update.bind(this);
}

ChartView.prototype.show = function() {
  var hash = window.location.hash.replace(/^#/, '');
  var point = this.selection = Math.abs(parseInt(hash, 16));

  if (this.init)
    return this.update();
  
  this.init = true;
  this.resize();
  this.update();

  window.addEventListener('resize', this.resize);
  this.el.parentElement.addEventListener('scroll', this.scroll);
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
  this.cols = breakPoint.cols;
  this.rows = Math.ceil(0x10FFFF / this.cols);
  this.rowHeight = breakPoint.rowHeight;
};

ChartView.prototype.rowAtIndex = function(i) {
  
};

ChartView.prototype.scroll = function() {
  
};

ChartView.prototype.update = function(point) {

};


// function ChartView() {
//   this.el = hg(template);
//   this.resize = this.resize.bind(this);
//   this.scroll = this.scroll.bind(this);
//   this.update = this.update.bind(this);
// }

// ChartView.prototype.show = function() {
//   var hash = window.location.hash.replace(/^#/, '');
//   var point = this.selection = Math.abs(parseInt(hash, 16));

//   if (this.init)
//     return this.update();
  
//   this.init = true;
//   this.resize();
//   this.update();

//   window.addEventListener('resize', this.resize);
//   this.el.parentElement.addEventListener('scroll', this.scroll);
// };

// ChartView.prototype.resize = function(evt) {
//   var width = window.innerWidth;
//   var breakPoint = null;
//   for (var i in breakPoints) {
//     breakPoint = breakPoints[i];
//     if (width >= breakPoint.start && 
//         width < breakPoint.end) {
//       break;
//     }
//   }
//   this.cols = breakPoint.cols;
//   this.rowHeight = breakPoint.rowHeight;
// };

// ChartView.prototype.scroll = function(evt) {
//   var change = this.last.scrollTop - this.el.parentElement.scrollTop;

//   // scroll down
//   if (change < -this.rowHeight || change > this.rowHeight) {
//     var rows = Math.ceil(change / this.rowHeight);
//     var nextPoint = this.last.point - rows * this.cols;
//     var scrollChange = rows * this.rowHeight;

//     this.update(nextPoint);
//     this.el.parentElement.scrollTop += scrollChange;
//     this.last.scrollTop = this.el.parentElement.scrollTop;

//     console.log('scroll', nextPoint, scrollChange);
//   }
// };

// ChartView.prototype.update = function(point) {
//   point = point || this.selection;
//   if (!point) point = 0;
//   else if (point > 0x10FFFF) point = 0x10FFFF;

//   var r = point % this.cols;
//   var i = point - 0x14 * this.cols - r;
//   var top = point + 0x14 * this.cols - r - 1;
//   var points = [];

//   if (i < 0) i = 0;
//   if (top > 0x10FFFF) top = 0x10FFFF;

//   while (i <= top) {
//     try {
//       var units = utf16.encode(i);
//       var string = units.reduce(function(string, unit) { return string += String.fromCharCode(unit) }, '');
//       var hex = i.toString(16);
//       points.push({
//         a: {
//           _attr: { href: '#' + hex, name: hex },
//         },
//         'a > div': string,
//       });
//     }
//     catch (err) {}
//     i++;
//   }

//   this.last = {
//     point: point,
//     scrollTop: this.el.parentElement.scrollTop,
//   };

//   console.log('updating', point.toString(16));

//   hg(this.el, { '.code-point': points });
// };
