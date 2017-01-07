let React = require('react')

import QuantityWidget from './quantity_widget.jsx' // eslint-disable-line

export default class CartTableWidget extends React.Component {
  constructor (props) {
    super(props)
    this.state = {items: []}
  }

  componentDidMount () {
    let self = this
    self.props.events.cartUpdated.add((cart) => {
      if (!!cart && cart.hasOwnProperty('items')) {
        self.setState({items: cart.items})
      }
    })
  }

  removeItem (item) {
    let self = this
    return () => {
      self.props.events.cartItemDeleted.dispatch(item.hash)
    }
  }

  increaseQty (item) {
    let self = this
    return () => {
      self.props.events.cartItemUpdated.dispatch(item, item.quantity + 1)
    }
  }

  decreaseQty (item) {
    let self = this
    return () => {
      if (item.quantity === 1) {
        self.props.events.cartItemDeleted.dispatch(item.hash)
      } else {
        self.props.events.cartItemUpdated.dispatch(item, item.quantity - 1)
      }
    }
  }

  render () {
    let self = this
    let rows = self.state.items.map((item) => {
      let priceAdjust = 0
      if (item.adjustments.hasOwnProperty('Price')) {
        priceAdjust = parseFloat(item.adjustments.Price)
      }
      let price = (parseFloat(item.basePrice) + priceAdjust).toFixed(2)
      let qty = item.quantity
      let total = (price * qty).toFixed(2)
      return <tr>
               <td className='control'>
                 <img src='/assets/delete-item.png' className='delete-item' onClick={self.removeItem(item)} />
               </td>
               <td className='thumbnail'>
                 <img className='checkout-thumbnail' src={item.thumbnailUrl} />
               </td>
               <td className='name'>{item.name}</td>
               <td className='price'>${price}</td>
               <td className='quantity'><QuantityWidget quantity={item.quantity} handleQtyIncrease={self.increaseQty(item)} handleQtyDecrease={self.decreaseQty(item)} /></td>
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
