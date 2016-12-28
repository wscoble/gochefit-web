var React = require('react')

module.exports = React.createClass({
  getInitialState: function() {
    return {
      priceAdjust: 0,
      quantity: 1
    }
  },

  componentDidMount: function() {
    var self = this
  },

  render: function() {
    var price = this.props.basePrice + this.state.priceAdjust
    return <div className="price-cart-widget">
             <div className="price">{price}</div>
             <div className="quantity">
               <span className="up"></span>
               <span className="currentQty">{this.state.quantity}</span>
               <span className="down"></span>
             </div>
             <div className="get-started">
               ADD TO CART
             </div>
           </div>
  }
})
