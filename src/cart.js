var CartWidget = require('./views/cart_widget.jsx')
var ReactDOM = require('react-dom')
var React = require('react')


module.exports = function(signals) {
  ReactDOM.render(React.createElement(CartWidget, {signals: signals}),
                  document.getElementById('cart-widget'))
}
