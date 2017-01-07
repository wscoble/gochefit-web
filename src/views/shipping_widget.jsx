let React = require('react')

export default class ShippingWidget extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      city: 'Las Vegas',
      state: 'NV'
    }
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

  handleAddressChange (stateKey) {
    return (event) => {
      let change = {}
      change[stateKey] = event.target.value
      this.setState(change)
    }
  }

  render () {
    return <div className='container'>
             <div className='address-form'>
               <input type='text' className='first-name' value={this.state.firstName} placeholder='First Name' onChange={(e) => this.handleAddressChange('firstName')(e)} />
               <input type='text' className='last-name' value={this.state.lastName} placeholder='Last Name' onChange={(e) => this.handleAddressChange('lastName')(e)} />
               <input type='email' className='email' value={this.state.email} placeholder='Email' onChange={(e) => this.handleAddressChange('email')(e)} />
               <input type='phone' className='phone' value={this.state.phone} placeholder='Phone' onChange={(e) => this.handleAddressChange('phone')(e)} />
               <input type='text' className='address' value={this.state.address1} placeholder='Address 1' onChange={(e) => this.handleAddressChange('address1')(e)} />
               <input type='text' className='address' value={this.state.address2} placeholder='Address 2' onChange={(e) => this.handleAddressChange('address2')(e)} />
               <input type='text' className='city' value={this.state.city} placeholder='City' onChange={(e) => this.handleAddressChange('city')(e)} />
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
             </div>
             <div className='cart-total'>
             </div>
           </div>
  }
}
