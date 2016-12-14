module.exports = function(events) {
  console.log('======= DEVELOPMENT MODE ACTIVE =======')
  Object.keys(events).forEach(function(key) {
    events[key].add(function() {
      var args = Array.prototype.slice.call(arguments)
      console.log('Caught signal: ' + key)
      for (var i in args) {
        console.log(args[i])
      }
    })
  })
}
