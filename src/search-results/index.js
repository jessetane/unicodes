var hg = require('hyperglue2');
var utf16 = require('utf16-transcoder');
var router = require('uri-router');
var template = require('./template.html');
var CodePoint = require('../code-point/model');

module.exports = SearchResults;

SearchResults.reuse = true;

function SearchResults() {
  var el = this.el = hg(template);

  this.el.addEventListener('click', function(evt) {
    if (evt.target.className === 'close-btn') {
      el.parentNode.classList.remove('show');
      el.parentNode.addEventListener('transitionend', clear);

      function clear() {
        el.parentNode.removeEventListener('transitionend', clear);
        router.search({ q: null });
      }
    }
  });
}

SearchResults.prototype.show = function(router) {
  var self = this;
  var query = router.location.query.q || '';
  var i, point, start, totalResults, results = [];
  var thumb = null;

  // show / hide
  if (query) this.el.parentNode.classList.add('show');
  else this.el.parentNode.classList.remove('show');

  // don't repeat
  if (query === this.lastQuery) return;
  else this.lastQuery = query;

  if (query) {
    hg(this.el, { '.meta': 'Searching...' })

    if (this.debounce) clearTimeout(this.debounce);
    this.debounce = setTimeout(function() {
      this.debounce = null;

      start = +new Date;
      CodePoint.search(query, function(err, points, total) {
        if (err) console.error(err);
        else {
          for (i in points) {
            point = points[i];
            thumb = utf16.encode(point.id).reduce(function(r, n) { return r + String.fromCharCode(n) }, '');
            results.push({
              '.thumbnail': thumb,
              a: {
                _text: point.name.toLowerCase(),
                _attr: { href: '#' + point.id.toString(16) }
              }
            });
          }
        }

        totalResults = total;
        render();
      });
    }, 250);
  }
  else render();

  function render() {
    if (query && results.length !== totalResults) {
      meta = totalResults + ' results found (showing ' + results.length + ') in ' + (+new Date - start).toPrecision(2) + ' milliseconds';
    }
    else if (query) {
      meta = totalResults + ' results found in ' + (+new Date - start).toPrecision(2) + ' milliseconds';
    }
    else {
      meta = '';
    }
    
    hg(self.el, {
      '.meta': meta,
      '.result': results
    });
  }
};
