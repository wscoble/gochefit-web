/* global $ */
module.exports = (events) => {
  if ($('.menu-wrapper').length === 0) {
    return
  }
  // we are on the menu page, let's do stuff!
  $('h1').click((e) => {
    $('.section').show()
    $('.section-selectors .selector').each(() => {
      $(this).removeClass('on')
    })
  })
  $('.section-selectors .selector').click((e) => {
    let section = $(this).attr('data-section')
    $('.section').each(() => {
      let self = $(this)
      if (self.attr('data-section') === section) {
        self.show()
      } else {
        self.hide()
      }
    })
    $('.section-selectors .selector').each(() => {
      if ($(this).attr('data-section') !== section) {
        $(this).removeClass('on')
      } else {
        $(this).addClass('on')
      }
    })
  })
}
