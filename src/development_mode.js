module.exports = (events) => {
  console.log('======= DEVELOPMENT MODE ACTIVE =======')
  Object.keys(events).forEach((key) => {
    events[key].add(() => {
      let args = Array.prototype.slice.call(arguments)
      console.log('Caught signal: ' + key, 'with', args.length, 'arguments')
      // if (key === 'debug') {
      //   console.log('Debug signal name is', args[0])
      //   for (let i in args) {
      //     console.log(args[i])
      //   }
      // }
    })
  })
}
