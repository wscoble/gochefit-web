module.exports = (events) => {
  console.log('======= DEVELOPMENT MODE ACTIVE =======')
  events.errored.add((error) => {
    console.log('found error:', error)
  })
  Object.keys(events).forEach((key) => {
    events[key].add(() => {
      console.log('Caught signal: ' + key, 'with', arguments.length, 'arguments')
    })
  })
}
