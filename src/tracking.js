/* global $ */
module.exports = (events) => {
  events.authenticated.add((credentials) => {})
  $('[data-title]').on('mouseenter', (e) => {
    let self = $(this)
    let sectionTitle = self.attr('data-title')
    events.track.dispatch(sectionTitle, 'mouse entered')
  })
  $('[data-on-click]').on('click', (e) => {
    let self = $(this)
    let eventName = self.attr('data-on-click')
    events.track.dispatch(eventName, 'clicked')
  })
}
