let md5 = require('../vendor/md5').md5
let helpers = require('../helpers')
let React = require('react')
import QuantityWidget from './quantity_widget.jsx' // eslint-disable-line

export default class PriceCartWidget extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      quantity: 1,
      selectedOptions: {},
      addMessage: 'ADD TO CART',
      adjustments: {}
    }
  }

  componentDidMount() {
    let options = this.props.options

    for (let optionName in options) {
      for (let option in options[optionName]) {
        if (options[optionName][option]['Price'] === 0) {
          let optionState = {}
          optionState[optionName] = option
          this.setState({selectedOptions: optionState})
          this.setState({adjustments: options[optionName][option]
          })
        }
      }
    }
  }

  handleQtyIncrease() {
    this.setState((p, props) => {
      return {
        quantity: p.quantity + 1
      }
    })
  }

  handleQtyDecrease() {
    if (this.state.quantity > 1) {
      this.setState((p, props) => {
        return {
          quantity: p.quantity - 1
        }
      })
    }
  }

  handleAddToCart() {
    let item = {
      name: this.props.name,
      basePrice: this.props.basePrice,
      adjustments: this.state.adjustments,
      options: this.props.options,
      selectedOptions: this.state.selectedOptions,
      thumbnailUrl: this.props.thumbnailUrl,
      itemUrl: window.location.pathname,
      shortDescription: this.props.shortDescription
    }
    item.hash = md5(JSON.stringify(item))
    item.quantity = this.state.quantity
    this.props.events.cartItemAdded.dispatch(item)
    this.setState({addMessage: 'ADDED'})

    setTimeout(() => {
      this.setState({addMessage: 'ADD TO CART'})
    }, 5000)
  }

  handleOptionSelect(name, value, changes) {
    return () => {
      let selectedOptionsChange = {}
      selectedOptionsChange[name] = value
      this.setState({selectedOptions: selectedOptionsChange})
      this.setState({adjustments: changes})
    }
  }

  render() {
    console.log(this.props)
    let macrosBlock,
      optionsBlock
    let adjustments = this.state.adjustments
    let macros = this.props.macros
    let options = this.props.options

    // update price
    let price = (parseFloat(this.props.basePrice) + adjustments['Price']).toFixed(2)

    // create macros block if we have macros data
    if (helpers.isEmptyObject(macros)) {
      macrosBlock = ''
    } else {
      let macrosList = Object.keys(macros).map((macroName) => {
        // parse '5g' into [_, '5', 'g', _ ...]
        let macroParts = /(\d+)(.*)/g.exec(macros[macroName])

        let value = parseInt(macroParts[1])
        let measurement = macroParts[2]
        if (adjustments[macroName]) {
          value += adjustments[macroName]
        }
        return <p>
          <span className="name">{macroName}</span>
          <span className="value">{value}{measurement}</span>
        </p>
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
      let optionsList = Object.keys(options).map((optionName) => {
        let optionChanges = Object.keys(options[optionName]).map((optionValue) => {
          // label for=? needs an id to link to
          let id = [optionName, optionValue].join('-')

          return <span className="option-value">
            <label htmlFor={id}>{optionValue}</label>
            <input id={id} type="radio" name="item-options" checked={this.state.selectedOptions[optionName] === optionValue} onClick={(e) => this.handleOptionSelect(optionName, optionValue, options[optionName][optionValue])(e)}/>
          </span>
        })
        return <span className="option-wrapper">
          <span className="option-name">{optionName}</span>
          {optionChanges}
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
      <QuantityWidget quantity={this.state.quantity} handleQtyIncrease={() => this.handleQtyIncrease()} handleQtyDecrease={() => this.handleQtyDecrease()}/>
      <div className="get-started">
        <span className="wrapper">
          <a onClick={(e) => this.handleAddToCart(e)}>{this.state.addMessage}</a>
        </span>
      </div>
      {macrosBlock}
      {optionsBlock}
    </div>
  }
}
