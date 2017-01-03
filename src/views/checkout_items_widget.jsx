var React = require('react')

var Quantity = React.createClass({
  render: function() {
    return <span>{this.props.qty}</span>
  }
})

module.exports = React.createClass({
  getInitialState: function() {
    return {
      items: []
    }
  },

  componentDidMount: function() {
    var self = this
    this.props.events.cartUpdated.add(function(cart) {
      if (!!cart && cart.hasOwnProperty('items')) {
        self.setState({items: cart.items})
      }
    })
  },

  removeItem: function(item) {
    var self = this
    return function() {
      self.props.events.cartItemDeleted.dispatch(item.hash)
    }
  },

  updateQty: function(item) {
    var self = this
    return function(qty) {
      self.props.events.cartItemUpdated(item, qty)
    }
  },

  render: function() {
    var self = this
    var rows = this.state.items.map(function(item) {
      var priceAdjust = 0
      if (item.adjustments.hasOwnProperty('Price')) {
        priceAdjust = parseFloat(item.adjustments.Price)
      }
      var price = (parseFloat(item.basePrice) + priceAdjust).toFixed(2)
      var qty = item.quantity
      var total = (price * qty).toFixed(2)
      return <tr>
               <td className='control'>
                 <img src='/assets/delete-item.png' className='delete-item' onClick={self.removeItem(item)} />
               </td>
               <td className='thumbnail'>
                 <img className='checkout-thumbnail' src={item.thumbnailUrl} />
               </td>
               <td className='name'>{item.name}</td>
               <td className='price'>${price}</td>
               <td className='quantity'><Quantity qty={item.quantity} onUpdate={self.updateQty(item)} /></td>
               <td className='total price'>${total}</td>
             </tr>
    })
    
    return <table>
             <thead>
               <th className='control'></th>
               <th className='thumbnail'></th>
               <th className='name'>Name</th>
               <th className='price'>Price</th>
               <th className='quantity'>Quantity</th>
               <th className='total price'>Total</th>
             </thead>
             <tbody>
               {rows}
             </tbody>
           </table>
  }
})
