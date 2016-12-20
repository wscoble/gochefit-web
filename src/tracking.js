module.exports = function(events) {
  events.authenticated.add(function(credentials) {

  })

  $('[data-title]').on('mouseenter', function(e) {
    var self = $(this)
    var sectionTitle = self.attr('data-title')
    events.track.dispatch(sectionTitle, 'mouse entered')
  })

  $('[data-on-click]').on('click', function(e) {
    var self = $(this)
    var eventName = self.attr('data-on-click')
    events.track.dispatch(eventName, 'clicked')
  })
}
