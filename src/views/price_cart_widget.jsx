var md5 = require('../vendor/md5').md5
var helpers = require('../helpers')
var React = require('react')

module.exports = React.createClass({
  getInitialState: function() {
    return {
      quantity: 1,
      selectedOptions: {},
      addMessage: 'ADD TO CART',
      macros: {},
      adjustments: {},
    }
  },

  componentDidMount: function() {
    this.setState({macros: this.props.macros})

    var self = this
    var options = this.props.options
    for (var optionName in options) {
      console.log(optionName)
      for (var option in options[optionName]) {
        console.log(option)
        console.log(options[optionName][option])
        if (options[optionName][option]['Price'] === 0) {
          var optionState = {}
          optionState[optionName] = option
          this.setState({
            selectedOptions: optionState
          })
          this.setState({adjustments: options[optionName][option]})
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
      adjustments: this.state.adjustments,
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

  handleOptionSelect: function(name, value, changes) {
    var self = this
    return function() {
      var selectedOptionsChange = {}
      selectedOptionsChange[name] = value
      self.setState({selectedOptions: selectedOptionsChange})
      self.setState({adjustments: changes})
    }
  },

  render: function() {
    var macrosBlock, optionsBlock
    var self = this
    var adjustments = this.state.adjustments
    var price = (parseFloat(this.props.basePrice) + adjustments['Price']).toFixed(2)
    var macros = this.state.macros
    if (helpers.isEmptyObject(macros)) {
      macrosBlock = ''
    } else {
      var macrosList = Object.keys(macros).map(function(k) {
        var macroParts = /(\d+)(.*)/g.exec(macros[k])
        var value = parseInt(macroParts[1])
        var measurement = macroParts[2]
        console.log(k, adjustments[k])
        if (adjustments[k]) {
          value += adjustments[k]
        }
        return <p><span className="name">{k}</span><span className="value">{value}{measurement}</span></p>
      })
      macrosBlock = <div className="macros">
                      <h2>MACROS</h2>
                      {macrosList}
                    </div>
    }
    var options = this.props.options
    if (helpers.isEmptyObject(options)) {
      optionsBlock = ''
    } else {
      var optionsList = Object.keys(options).map(function(k0) {
        var optionChanges = Object.keys(options[k0]).map(function(k1) {
          var id = [k0, k1].join('-')
          return <span className="option-value">
                   <label htmlFor={id}>{k1}</label>
                   <input id={id} type="radio" name="item-options" checked={self.state.selectedOptions[k0] === k1} onClick={self.handleOptionSelect(k0, k1, options[k0][k1])} />
                 </span>
        })
        return <span className="option-wrapper">
                 <span className="option-name">{k0}</span> {optionChanges}
               </span>
      })
      optionsBlock = <div className="options">
                       <h2>OPTIONS</h2>
                       {optionsList}
                     </div>
    }
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
             {macrosBlock}
             {optionsBlock}
           </div>
  }
})
