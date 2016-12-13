var signals = require('./signals')
var cart = require('./cart')(signals)
var payments = require('./payments')(signals)
var tracking = require('./tracking')(signals)
var aws = require('./aws')(signals)

if (process.env.DEVELOPMENT === '1') {
  require('./development_mode')(signals)
  if (process.env.RANDOM_SIGNALS === '1') {
    setInterval(function() {
      signals.cartUpdated.dispatch({
        totalItems: Math.floor(Math.random() * 25)
      })
    }, 5500)
  }
}
