var React = require('react')

module.exports = React.createClass({
  getInitialState: function() {
    return {
      items: 0
    }
  },

  componentDidMount: function() {
    var self = this
    this.props.events.cartUpdated.add(function(cart) {
      self.setState({items: cart.totalItems})
    })
  },

  startCheckout: function() {
    window.location.pathname = '/checkout-1.html'
  },

  render: function() {
    var itemsText = 'Items'
    if (this.state.items === 1) {
      itemsText = 'Item'
    }
    return <span className='cart-widget' onClick={this.startCheckout}>
             <img src='/assets/cart.png' />
             <label>{this.state.items} {itemsText}</label>
           </span>
  }
})
