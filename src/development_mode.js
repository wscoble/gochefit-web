module.exports = function(signals) {
  console.log('======= DEVELOPMENT MODE ACTIVE =======')
  Object.keys(signals).forEach(function(key) {
    signals[key].add(function(d) {
      console.log('Caught signal: ' + key)
      console.log(d)
    })
  })
}
