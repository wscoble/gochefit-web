module.exports = events => {
  events.errored.add(error => {
    events.track.dispatch(error, 'error')
  })
}
