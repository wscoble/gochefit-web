var md5 = require('../vendor/md5').md5
var helpers = require('../helpers')
var React = require('react')

module.exports = React.createClass({
  getInitialState: function() {
    return {
      quantity: 1,
      selectedOptions: {},
      addMessage: 'ADD TO CART',
      adjustments: {},
    }
  },

  componentDidMount: function() {
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
      thumbnailUrl: this.props.thumbnailUrl,
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
    var macros = this.props.macros
    var options = this.props.options

    // update price
    var price = (parseFloat(this.props.basePrice) + adjustments['Price']).toFixed(2)

    // create macros block if we have macros data
    if (helpers.isEmptyObject(macros)) {
      macrosBlock = ''
    } else {
      var macrosList = Object.keys(macros).map(function(macroName) {
        // parse '5g' into [_, '5', 'g', _ ...]
        var macroParts = /(\d+)(.*)/g.exec(macros[macroName])

        var value = parseInt(macroParts[1])
        var measurement = macroParts[2]
        if (adjustments[macroName]) {
          value += adjustments[macroName]
        }
        return <p><span className="name">{macroName}</span><span className="value">{value}{measurement}</span></p>
      })
      macrosBlock = <div className="macros">
                      <h2>MACROS</h2>
                      {macrosList}
                    </div>
    }

    // create options block if we have options data
    if (helpers.isEmptyObject(options)) {
      optionsBlock = ''
    } else {
      var optionsList = Object.keys(options).map(function(optionName) {
        var optionChanges = Object.keys(options[optionName]).map(function(optionValue) {
          // label for=? needs an id to link to
          var id = [optionName, optionValue].join('-')

          return <span className="option-value">
                   <label htmlFor={id}>{optionValue}</label>
                   <input id={id}
                          type="radio"
                          name="item-options"
                          checked={self.state.selectedOptions[optionName] === optionValue}
                          onClick={self.handleOptionSelect(optionName, optionValue, options[optionName][optionValue])} />
                 </span>
        })
        return <span className="option-wrapper">
                 <span className="option-name">{optionName}</span> {optionChanges}
               </span>
      })
      optionsBlock = <div className="options">
                       <h2>OPTIONS</h2>
                       {optionsList}
                     </div>
    }

    // render the final widget
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
