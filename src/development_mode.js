module.exports = function(events) {
  console.log('======= DEVELOPMENT MODE ACTIVE =======')
  Object.keys(events).forEach(function(key) {
    events[key].add(function(d) {
      console.log('Caught signal: ' + key)
      console.log(d)
    })
  })
}
