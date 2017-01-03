module.exports = function(events) {
  if ($('.menu-wrapper').length === 0) {
    return
  }

  // we are on the menu page, let's do stuff!

  $('h1').click(function(e) {
    $('.section').show()
    $('.section-selectors .selector').each(function() {
      $(this).removeClass('on')
    })
  })

  $('.section-selectors .selector').click(function(e) {
    var section = $(this).attr('data-section')
    $('.section').each(function() {
      var self = $(this)
      if (self.attr('data-section') === section) {
        self.show()
      } else {
        self.hide()
      }
    })
    $('.section-selectors .selector').each(function() {
      if ($(this).attr('data-section') !== section) {
        $(this).removeClass('on')
      } else {
        $(this).addClass('on')
      }
    })
  })
}
