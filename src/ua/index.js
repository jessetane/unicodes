var ua = window.navigator.userAgent

exports.small = window.screen.height < 768
exports.android = /Android/.test(ua)
exports.ios = /iPod|iPhone|iPad/.test(ua) && /AppleWebKit/.test(ua)
exports.touch = exports.android || exports.ios // how to add FF OS and MS things?

if (exports.ios) {
  document.documentElement.classList.add('ios')
}
