/* global $ */
require('./vendor/jquery.slides')
module.exports = (events) => {
  let e = $('#slides')
  if (e) {
    let options = {
      width: parseInt(e.attr('data-width')),
      height: parseInt(e.attr('data-height')),
      navigation: {
        active: false
      },
      pagination: {
        active: false
      },
      play: {
        active: false,
        effect: 'slide',
        interval: 7500,
        auto: true,
        pauseOnHover: true,
        restartDelay: 2500
      }
    }
    e.slidesjs(options)
  }
}
