let React = require('react')

export default class ShippingWidget extends React.Component {
  constructor (props) {
    super(props)
    this.state = {itemCount: 0}
  }

  componentDidMount () {
    let self = this
    this.props.events.cartUpdated.add((cart) => {
      self.setState({itemCount: cart.totalItems})
    })
  }

  startCheckout () {
    window.location.pathname = '/checkout-1.html'
  }

  render () {
    return <div className='container'>
             <span className='address-form'>
             </span>
             <span className='shipping-selector'>
             </span>
             <span className='subtotal'>
             </span>
             <span className='taxes'>
             </span>
             <span className='shipping-cost'>
             </span>
             <span className='cart-total'>
             </span>
           </div>
  }
}
