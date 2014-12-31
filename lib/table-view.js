var floor = Math.floor;

module.exports = TableView;

function TableView() {
  this.rows = {};
  this.rowHeight = this.rowHeight || 100;
  this.scroller  = this.scroller || this.el;
  this.content = this.content || this.el.firstElementChild;
  this.updateRequested = false;
  this.update = this.update.bind(this);
  this.onscroll = this.onscroll.bind(this);
  this.scroller.addEventListener('scroll', this.onscroll);
  this.overflow = 0;
}

TableView.prototype.onscroll = function() {
  if (this.updateRequested) return;
  requestAnimationFrame(this.update);
  this.updateRequested = true;

  // ugh, but we need this for decent scrolling performance
  if (!this.scrolling) {
    var self = this;
    var mark = this.scroller.scrollTop;
    this.content.style.pointerEvents = 'none';
    this.scrolling = setInterval(function() {
      if (mark === self.scroller.scrollTop) {
        self.content.style.pointerEvents = null;
        clearInterval(self.scrolling);
        self.scrolling = false;
      }
      else {
        mark = self.scroller.scrollTop;
      }
    }, 100);
  }
};

TableView.prototype.update = function() {
  var scroller = this.scroller;
  var content = this.content;
  var scrollTop = scroller.scrollTop;
  var rowCount = this.rowCount;
  var rowHeight = this.rowHeight;
  var start = floor(scrollTop / rowHeight) - this.overflow;
  var end = floor((scrollTop + scroller.offsetHeight) / rowHeight) + this.overflow;
  var existing = {};
  var i, row, rows = this.rows;

  if (start < 0) start = 0;
  if (end >= rowCount) end = rowCount - 1;

  for (i in rows) {
    if (i < start || i > end) {
      content.removeChild(rows[i]);
      delete rows[i];
    }
    else {
      existing[i] = true;
    }
  }

  i = start;
  while (i <= end) {
    if (!existing[i]) {
      row = rows[i] = this.rowAtIndex(i);
      row.style.top = rowHeight * i + 'px';
      content.appendChild(row);
    }
    i++;
  }

  var height = rowCount * rowHeight;
  if (this.height !== height) {
    content.style.height = height + 'px';
    this.height = height;
  }

  this.updateRequested = false;
};

TableView.prototype.hide = function() {
  this.scroller.removeEventListener('scroll', this.onscroll);
};
