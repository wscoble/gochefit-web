var events = require('./events')
var loading = require('./loading')(events)
var cart_widget = require('./cart_widget')(events)
var cart_handler = require('./cart_handler')(events)
var messaging = require('./messaging')(events)
var payments = require('./payments')(events)
var tracking = require('./tracking')(events)
var aws = require('./aws')(events)
var slides = require('./slides')(events)
var menu = require('./menu')(events)

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
