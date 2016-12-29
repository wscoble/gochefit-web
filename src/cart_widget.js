var CartWidget = require('./views/cart_widget.jsx')
var PriceCartWidget = require('./views/price_cart_widget.jsx')
var ReactDOM = require('react-dom')
var React = require('react')


module.exports = function(events) {
  var cartWidgetElement = document.getElementById('cart-widget')

  if (!!cartWidgetElement) {
    ReactDOM.render(React.createElement(CartWidget, {events: events}),
                    cartWidgetElement)
  }


  var priceCartWidgetElement = document.getElementById('price-cart-widget')

  if (!!priceCartWidgetElement) {
    var basePrice = priceCartWidgetElement.getAttribute('data-base-price')
    var options = JSON.parse(priceCartWidgetElement.getAttribute('data-options'))
    var name = priceCartWidgetElement.getAttribute('data-name')

    ReactDOM.render(React.createElement(PriceCartWidget, {events: events,
                                                          basePrice: basePrice,
                                                          options: options,
                                                          name: name}),
                    priceCartWidgetElement)
  }

  // wire up cart events
  events.cartDatasetOpened.add(function(dataset) {
    events.cartItemAdded.add(function(item) {
      dataset.get('items', function(err, value) {
        if (err) {
          events.errored.dispatch(err)
        } else {
          var items = []
          if (value) {
            items = JSON.parse(value)

            // update quantity if item already exists in cart
            itemsHashes = items.map(function(i) {
              return i.hash
            })
            var hashIndex = itemsHashes.indexOf(item.hash)
            if (hashIndex > -1) {
              items[hashIndex].quantity += item.quantity
            } else {
              items.push(item)
            }
          } else {
            items.push(item)
          }

          dataset.put('items', JSON.stringify(items), function(err, record) {
            if (err) {
              events.errored.dispatch(err)
            } else {
              events.debug.dispatch(record, 'updated-cart')
              events.cartUpdated.dispatch({totalItems: items.map(function(item) {
                                                         return item.quantity
                                                       }).reduce(function(a, b) {
                                                         return a + b
                                                       }, 0)})

            }
          })
        }
      })
    })
  })
}
