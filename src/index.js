var events = require('./events')
var cart = require('./cart')(events)
var payments = require('./payments')(events)
var tracking = require('./tracking')(events)
var aws = require('./aws')(events)

if (process.env.DEVELOPMENT === '1') {
  require('./development_mode')(events)
  if (process.env.RANDOM_SIGNALS === '1') {
    setInterval(function() {
      events.cartUpdated.dispatch({
        totalItems: Math.floor(Math.random() * 25)
      })
    }, 5500)
  }
}
