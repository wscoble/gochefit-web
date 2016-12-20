var CartWidget = require('./views/cart_widget.jsx')
var ReactDOM = require('react-dom')
var React = require('react')


module.exports = function(events) {
  ReactDOM.render(React.createElement(CartWidget, {events: events}),
                  document.getElementById('cart-widget'))
}
