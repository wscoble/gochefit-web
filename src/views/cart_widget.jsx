let React = require('react')

export default class CartWidget extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      itemCount: 0
    }
  }

  componentDidMount() {
    let self = this
    this.props.events.cartUpdated.add((cart) => {
      self.setState({itemCount: cart.totalItems})
    })
  }

  startCheckout() {
    window.location.pathname = '/checkout-1.html'
  }

  render() {
    let itemCount = this.state.itemCount
    let itemsText = 'Items'
    if (itemCount === 1) {
      itemsText = 'Item'
    }
    return <span className='cart-widget' onClick={this.startCheckout}>
      <img src='/assets/cart.png'/>
      <label>{itemCount} {itemsText}</label>
    </span>
  }
}
