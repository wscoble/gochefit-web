var React = require('react')
var ReactDOM = require('react-dom')
var AWS = require('aws-sdk')


module.exports = React.createClass({
  getInitialState: function() {
    return {
      items: 0
    }
  },

  componentDidMount: function() {
    var self = this
    this.props.signals.cartUpdated.add(function(cart) {
      self.setState({items: cart.totalItems})
    })
  },

  render: function() {
    var itemsText = 'Items'
    if (this.state.items === 1) {
      itemsText = 'Item'
    }
    return <span className='cart-widget'>
             <img src='/assets/cart.png' />
             <label>{this.state.items} {itemsText}</label>
           </span>
  }
})
