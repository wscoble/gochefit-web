let React = require('react')

class ShippingMethodWidget extends React.Component { // eslint-disable-line
  constructor (props) {
    super(props)
    this.state = {
      freeShipping: false,
      cost: 5,
      message: ''
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (Object.keys(this.props).map(
          (property) => {
            if (property === 'lambda') {
              return this.props.lambda !== null
            }

            return this.props[property] === prevProps[property]
          }
        ).reduce(
          (a, b) => a && b
          , true
        )) {
      return
    }

    if (this.props.lambda === null) {
      return
    }

    let params = {
      FunctionName: 'ShippingCalculator',
      InvocationType: 'RequestResponse',
      Payload: JSON.stringify({
        subtotal: this.props.cartSubtotal,
        city: this.props.city,
        state: this.props.state
      })
    }

    this.props.lambda.invoke(params, (err, data) => {
      if (err) {
        this.props.events.errored.dispatch(err)
      } else {
        let d = JSON.parse(data.Payload)
        if (d.freeShipping === this.state.freeShipping) {
          return
        }
        if (d.freeShipping) {
          this.setState({
            freeShipping: true,
            cost: 0,
            message: 'Free!'
          })
        } else {
          this.setState({
            freeShipping: false,
            cost: d.shippingCost,
            message: ''
          })
        }
        this.forceUpdate()
      }
    })
  }

  render () {
    let message
    if (this.state.freeShipping) {
      message = <span className='message'>{this.state.message}</span>
    } else {
      message = <span className='message price'>${this.state.cost}</span>
    }
    return <span className='shipping-widget'>
             <span className='header'>Shipping</span>
             {message}
           </span>
  }
}

export default class ShippingWidget extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      city: 'Las Vegas',
      finalCity: 'Las Vegas',
      state: 'NV',
      subtotal: 0
    }
    this.lambda = null
  }

  calculateSubtotal (cart) {
    console.log('cart items', cart.items)
    return cart.items.map(
      (item) => item.quantity * (parseFloat(item.basePrice) + item.adjustments.Price)
    ).reduce(
      (ttl, price) => ttl + price
    , 0)
  }

  componentDidMount () {
    let self = this
    this.props.events.cartUpdated.add((cart) => {
      self.setState({itemCount: cart.totalItems})
      self.setState({subtotal: this.calculateSubtotal(cart)})
    })
    this.props.events.lambdaAvailable.add((lambda) => {
      this.lambda = lambda
    })
  }

  startCheckout () {
    window.location.pathname = '/checkout-1.html'
  }

  handleAddressChange (stateKey) {
    return (event) => {
      let change = {}
      change[stateKey] = event.target.value
      this.setState(change)
    }
  }

  handleCityBlur (event) {
    this.setState({finalCity: event.target.value})
  }

  render () {
    console.log('state', this.state)
    return <div className='container'>
             <div className='address-form'>
               <input type='text' className='first-name' value={this.state.firstName} placeholder='First Name' onChange={(e) => this.handleAddressChange('firstName')(e)} />
               <input type='text' className='last-name' value={this.state.lastName} placeholder='Last Name' onChange={(e) => this.handleAddressChange('lastName')(e)} />
               <input type='email' className='email' value={this.state.email} placeholder='Email' onChange={(e) => this.handleAddressChange('email')(e)} />
               <input type='phone' className='phone' value={this.state.phone} placeholder='Phone' onChange={(e) => this.handleAddressChange('phone')(e)} />
               <input type='text' className='address' value={this.state.address1} placeholder='Address 1' onChange={(e) => this.handleAddressChange('address1')(e)} />
               <input type='text' className='address' value={this.state.address2} placeholder='Address 2' onChange={(e) => this.handleAddressChange('address2')(e)} />
               <input type='text' className='city' value={this.state.city} placeholder='City' onBlur={(e) => this.handleCityBlur(e)} onChange={(e) => this.handleAddressChange('city')(e)} />
               <input type='text' className='state' value={this.state.state} placeholder='State' />
               <input type='text' className='zip' value={this.state.zip} placeholder='Zip Code' onChange={(e) => this.handleAddressChange('zip')(e)} />
             </div>
             <div className='shipping-selector'>
             </div>
             <div className='subtotal'>
             </div>
             <div className='taxes'>
             </div>
             <div className='shipping-cost'>
               <ShippingMethodWidget cartSubtotal={this.state.subtotal} city={this.state.finalCity} state={this.state.state} lambda={this.lambda} />
             </div>
             <div className='cart-total'>
             </div>
           </div>
  }
}
