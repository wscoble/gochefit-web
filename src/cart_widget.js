import CartWidget from './views/cart_widget.jsx'
import PriceCartWidget from './views/price_cart_widget.jsx'
import CheckoutItemsWidget from './views/checkout_items_widget.jsx'
import ShippingWidget from './views/shipping_widget.jsx'
import PaymentWidget from './views/payment_widget.jsx'
let ReactDOM = require('react-dom')
let React = require('react')
module.exports = (events) => {
  let cartWidgetElement = document.getElementById('cart-widget')
  if (cartWidgetElement) {
    ReactDOM.render(React.createElement(CartWidget, {
      events: events
    }), cartWidgetElement)
  }
  let priceCartWidgetElement = document.getElementById('price-cart-widget')
  if (priceCartWidgetElement) {
    let basePrice = priceCartWidgetElement.getAttribute('data-base-price')
    let name = priceCartWidgetElement.getAttribute('data-name')
    let thumbnailUrl = priceCartWidgetElement.getAttribute(
      'data-thumbnail-url')
    let shortDescription = priceCartWidgetElement.getAttribute(
      'data-short-description')
    let options = {}
    let macros = {}
    if (priceCartWidgetElement.getAttribute('data-options') !== '') {
      options = JSON.parse(priceCartWidgetElement.getAttribute('data-options'))
    }
    if (priceCartWidgetElement.getAttribute('data-macros') !== '') {
      macros = JSON.parse(priceCartWidgetElement.getAttribute('data-macros'))
    }
    let props = {
      events: events,
      basePrice: basePrice,
      options: options,
      macros: macros,
      thumbnailUrl: thumbnailUrl,
      name: name,
      shortDescription: shortDescription
    }
    ReactDOM.render(React.createElement(PriceCartWidget, props),
      priceCartWidgetElement)
  }
  let checkoutTableWidgetElement = document.getElementById('checkout-items')
  if (checkoutTableWidgetElement) {
    ReactDOM.render(React.createElement(CheckoutItemsWidget, {
      events: events
    }), checkoutTableWidgetElement)
  }
  let shippingWidgetElement = document.getElementById('shipping-widget')
  if (shippingWidgetElement) {
    ReactDOM.render(React.createElement(ShippingWidget, {
      events: events
    }), shippingWidgetElement)
  }
  let paymentWidgetElement = document.getElementById('payment-widget')
  if (paymentWidgetElement) {
    ReactDOM.render(React.createElement(PaymentWidget, {
      events: events,
      paypal_success_url: process.env.PAYPAL_SUCCESS_URL,
      paypal_cancel_url: process.env.PAYPAL_CANCEL_URL
    }), paymentWidgetElement)
  }
}
