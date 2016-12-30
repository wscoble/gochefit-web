var Accept = window.Accept || {}
var helpers = require('./helpers')

module.exports = function(events) {
  events.cartDatasetOpened.add(function(dataset) {
    dataset.get('items', function(err, cart) {
      if (err) {
        events.errored.dispatch(err)
      } else if (cart) {
        events.cartUpdated.dispatch({totalItems: helpers.getItemCountFromCart(cart)})
      }
    })

    // wire up cart events
    events.cartItemAdded.add(function(item) {
      dataset.get('items', function(err, value) {
        if (err) {
          events.errored.dispatch(err)
        } else {
          var cart = []
          if (value) {
            cart = JSON.parse(value)

            // update quantity if item already exists in cart
            itemsHashes = cart.map(function(i) {
              return i.hash
            })
            var hashIndex = itemsHashes.indexOf(item.hash)
            if (hashIndex > -1) {
              items[hashIndex].quantity += item.quantity
            } else {
              cart.push(item)
            }
          } else {
            cart.push(item)
          }

          dataset.put('items', JSON.stringify(cart), function(err, record) {
            if (err) {
              events.errored.dispatch(err)
            } else {
              dataset.synchronize()
              events.debug.dispatch(record, 'updated-cart')
              events.cartUpdated.dispatch({totalItems: helpers.getItemCountFromCart(cart)})

            }
          })
        }
      })
    })
  })
}
