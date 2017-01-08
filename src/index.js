let events = require('./events')
require('./loading')(events)
require('./checkout')(events)
require('./cart_widget')(events)
require('./cart_handler')(events)
require('./messaging')(events)
require('./payments')(events)
require('./tracking')(events)
require('./aws')(events)
require('./slides')(events)
require('./menu')(events)
if (process.env.DEVELOPMENT === '1') {
  require('./development_mode')(events)
  if (process.env.RANDOM_SIGNALS === '1') {
    setInterval(() => {
      events.cartUpdated.dispatch({
        totalItems: Math.floor(Math.random() * 25)
      })
    }, 5500)
  }
}
