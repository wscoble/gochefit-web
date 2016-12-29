var md5 = require('../vendor/md5').md5
var React = require('react')

module.exports = React.createClass({
  getInitialState: function() {
    return {
      priceAdjust: 0,
      quantity: 1,
      selectedOptions: {},
      addMessage: 'ADD TO CART',
    }
  },

  componentDidMount: function() {
    var self = this
    var options = this.props.options
    for (var optionName in options) {
      for (var option in options[optionName]) {
        if (options[optionName][option] === 0) {
          var optionState = {}
          optionState[optionName] = option
          this.setState({
            selectedOptions: optionState
          })
        }
      }
    }
  },

  handleQtyIncrease: function() {
    this.setState(function(p, props) {
      return {quantity: p.quantity + 1}
    })
  },

  handleQtyDecrease: function() {
    if (this.state.quantity > 1) {
      this.setState(function(p, props) {
        return {quantity: p.quantity - 1}
      })
    }
  },

  handleAddToCart: function() {
    var item = {
      name: this.props.name,
      basePrice: this.props.basePrice,
      priceAdjust: this.state.priceAdjust,
      options: this.props.options,
      selectedOptions: this.state.selectedOptions,
    }
    item.hash = md5(JSON.stringify(item))
    item.quantity = this.state.quantity
    this.props.events.cartItemAdded.dispatch(item)
    this.setState({addMessage: 'ADDED'})

    var self = this
    setTimeout(function() {
      self.setState({addMessage: 'ADD TO CART'})
    }, 5000)
  },

  render: function() {
    var price = this.props.basePrice + this.state.priceAdjust
    return <div className="price-cart-widget">
             <div className="price">${price}</div>
             <div className="quantity">
               <img src="/assets/arrow-up.png" className="above" onClick={this.handleQtyIncrease} />
               {this.state.quantity}
               <img src="/assets/arrow-down.png" className="below" onClick={this.handleQtyDecrease} />
             </div>
             <div className="get-started">
               <span className="wrapper">
                 <a onClick={this.handleAddToCart}>{this.state.addMessage}</a>
               </span>
             </div>
           </div>
  }
})
