var ua = require('../ua')

if (ua.ios) {
  var threshold = 5
  var scroller = document.querySelector('x-chart')
  document.documentElement.addEventListener('touchstart', evt => {
    touchstart = evt.touches[0]
  })
  document.documentElement.addEventListener('touchmove', evt => {
    var touch = evt.touches[0]
    var scrollHeight = scroller.scrollHeight - scroller.offsetHeight
    var scrollTop = scroller.scrollTop
    if (scrollTop <= 0) {
      if (touch.screenY - touchstart.screenY > threshold) {
        evt.preventDefault()
      }
    } else if (scrollTop >= scrollHeight) {
      if (touch.screenY - touchstart.screenY < threshold) {
        evt.preventDefault()
      }
    }
  })
}
