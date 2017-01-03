var CartWidget = require('./views/cart_widget.jsx')
var PriceCartWidget = require('./views/price_cart_widget.jsx')
var CheckoutItemsWidget = require('./views/checkout_items_widget.jsx')
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
    var name = priceCartWidgetElement.getAttribute('data-name')
    var thumbnailUrl = priceCartWidgetElement.getAttribute('data-thumbnail-url')
    var options = {}, macros = {}
    if (priceCartWidgetElement.getAttribute('data-options') !== '') {
      options = JSON.parse(priceCartWidgetElement.getAttribute('data-options'))
    }
    if (priceCartWidgetElement.getAttribute('data-macros') !== '') {
      macros = JSON.parse(priceCartWidgetElement.getAttribute('data-macros'))
    }

    ReactDOM.render(React.createElement(PriceCartWidget, {events: events,
                                                          basePrice: basePrice,
                                                          options: options,
                                                          macros: macros,
                                                          thumbnailUrl: thumbnailUrl,
                                                          name: name}),
                    priceCartWidgetElement)
  }


  var checkoutTableWidgetElement = document.getElementById('checkout-items')

  if (!!checkoutTableWidgetElement) {
    ReactDOM.render(React.createElement(CheckoutItemsWidget, {events: events}),
                    checkoutTableWidgetElement)
  }
}
