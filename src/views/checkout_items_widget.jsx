let React = require('react')

import QuantityWidget from './quantity_widget.jsx' // eslint-disable-line

class SelectedOptionsWidget extends React.Component { // eslint-disable-line
  render() {
    console.log('selected options widget:', this.props)
    let options = Object.keys(this.props.selectedOptions).map((key) => {
      return <p>{key}: {this.props.selectedOptions[key]}</p>
    })
    return <small>
      {options}
    </small>
  }
}

export default class CartTableWidget extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      items: []
    }
  }

  componentDidMount() {
    this.props.events.cartUpdated.add((cart) => {
      if (!!cart && cart.hasOwnProperty('items')) {
        this.setState({items: cart.items})
      }
    })
  }

  removeItem(item) {
    return () => {
      this.props.events.cartItemDeleted.dispatch(item.hash)
    }
  }

  increaseQty(item) {
    return () => {
      this.props.events.cartItemUpdated.dispatch(item, item.quantity + 1)
    }
  }

  decreaseQty(item) {
    return () => {
      if (item.quantity === 1) {
        this.props.events.cartItemDeleted.dispatch(item.hash)
      } else {
        this.props.events.cartItemUpdated.dispatch(item, item.quantity - 1)
      }
    }
  }

  render() {
    let rows = this.state.items.map((item) => {
      let priceAdjust = 0
      if (item.adjustments.hasOwnProperty('Price')) {
        priceAdjust = parseFloat(item.adjustments.Price)
      }
      let price = (parseFloat(item.basePrice) + priceAdjust).toFixed(2)
      let qty = item.quantity
      let total = (price * qty).toFixed(2)
      return <tr>
        <td className='control'>
          <img
            src='/assets/delete-item.png'
            className='delete-item'
            onClick={this.removeItem(item)}/>
        </td>
        <td className='thumbnail'>
          <img className='checkout-thumbnail' src={item.thumbnailUrl}/>
        </td>
        <td className='name'>
          <a href={item.itemUrl}>{item.name}</a>
          <SelectedOptionsWidget selectedOptions={item.selectedOptions}/>
          <p className='short-description'>{item.shortDescription}</p>
        </td>
        <td className='price'>${price}</td>
        <td className='quantity'><QuantityWidget
          quantity={item.quantity}
          handleQtyIncrease={this.increaseQty(item)}
          handleQtyDecrease={this.decreaseQty(item)}/></td>
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
}
