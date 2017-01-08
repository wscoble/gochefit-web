import React from 'react'

export default class ShippingWidget extends React.Component {
  constructor(props) {
    super(props)
    this.lambdaPromise = new Promise((resolve, reject) => {
      props.events.lambdaAvailable.add((lambda) => {
        resolve(lambda)
      })
    })
    this.shippingDatasetPromise = new Promise((resolve, reject) => {
      props.events.shippingDatasetOpened.add((dataset) => {
        resolve(dataset)
      })
    })
    this.state = {
      city: '',
      finalCity: '',
      state: 'NV',
      subtotal: 0.00,
      taxes: 0.00,
      total: 0.00,
      shippingCost: 0.00,
      shippingMessage: '-',
      freeShipping: true,
      errors: []
    }
  }

  componentDidMount() {
    new Promise((resolve, reject) => {
      this.props.events.cartUpdated.add((cart) => {
        resolve(cart.items.map((item) => item.quantity * (parseFloat(item.basePrice) + item.adjustments.Price)).reduce((ttl, price) => ttl + price, 0))
      })
    }).then((subtotal) => {
      this.setState({subtotal: subtotal})
    })

    this.shippingDatasetPromise.then(dataset => {
      dataset.get('shipping-info', (err, dataStr) => {
        if (err) {
          this.props.events.errored.dispatch(err)
        } else {
          if (dataStr) {
            let data = JSON.parse(dataStr)
            data['finalCity'] = data['city']
            this.setState(data)
          }
        }
      })
    })
  }

  componentDidUpdate(prevProps, prevState) {
    this.lambdaPromise.then(lambda => {
      return new Promise((resolve, reject) => {
        let update = {}
        if (this.state.finalCity !== prevState.finalCity && this.state.subtotal > 0) {
          let params = {
            FunctionName: 'ShippingCalculator',
            InvocationType: 'RequestResponse',
            Payload: JSON.stringify({city: this.state.finalCity, subtotal: this.state.subtotal})
          }

          lambda.invoke(params, (err, data) => {
            if (err) {
              this.props.events.errored.dispatch(err)
            } else {
              let result = JSON.parse(data.Payload)
              update['shippingCost'] = result.shippingCost
              update['shippingMessage'] = result.freeShipping
                ? 'Free!'
                : result.shippingCost.toFixed(2)
              update['freeShipping'] = result.freeShipping
              resolve(update)
            }
          })
        } else {
          resolve(update)
        }
      }).then((update) => {
        return new Promise((resolve, reject) => {
          // if we have an updated shipping cost or if we haven't calculated taxes yet
          if ((update.hasOwnProperty('shippingCost')) || (this.state.taxes === 0 && this.state.total === 0 && this.state.subtotal !== 0)) {
            let params = {
              FunctionName: 'TaxCalculator',
              InvocationType: 'RequestResponse',
              Payload: JSON.stringify({subtotal: this.state.subtotal})
            }

            lambda.invoke(params, (err, data) => {
              if (err) {
                this.props.events.errored.dispatch(err)
              } else {
                let result = JSON.parse(data.Payload)
                update['taxes'] = result.taxes
                update['total'] = result.total
                if (update.hasOwnProperty('shippingCost')) {
                  update['total'] += update.shippingCost
                }
                resolve(update)
              }
            })
          } else {
            resolve(update)
          }
        })
      }).then((update) => {
        if (Object.keys(update).length > 0) {
          this.setState(update)
        }
      })
    })
    this.shippingDatasetPromise.then(dataset => {
      const shippingValues = {
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        email: this.state.email,
        phone: this.state.phone,
        address1: this.state.address1,
        address2: this.state.address2,
        city: this.state.city,
        state: this.state.state,
        zip: this.state.zip
      }
      dataset.put('shipping-info', JSON.stringify(shippingValues), (err, newRecords) => {
        if (err) {
          this.props.events.errored.dispatch(err)
        } else {
          dataset.synchronize({
            onFailure: (err) => {
              this.props.events.errored.dispatch(err)
            },
            onConflict: (dataset, conflicts, callback) => {
              let resolved = []
              for (let i = 0; i < conflicts.length; i++) {
                resolved.push(conflicts[i].resolveWithLocalRecord())
              }
              dataset.resolve(resolved, () => callback(true))
            }
          })
        }
      })
    })
  }

  startCheckout() {
    window.location.pathname = '/checkout-1.html'
  }

  handleAddressChange(stateKey) {
    return (event) => {
      let change = {}
      change[stateKey] = event.target.value
      this.setState(change)
    }
  }

  handleCityBlur(event) {
    this.setState({finalCity: event.target.value})
  }

  handleConfirmation(event) {
    console.log('CONFIRM')
  }

  hasError(field) {
    if (field === 'firstName') {
      return 'error'
    }
    return ''
  }

  hasSuccess(field) {
    if (field === 'city') {
      return 'success'
    }
    return ''
  }

  render() {
    let subtotal = this.state.subtotal.toFixed(2)
    let total = this.state.total.toFixed(2)
    let taxes = this.state.taxes.toFixed(2)
    let shipping = <span className='value dollar'>{this.state.shippingMessage}</span>
    if (this.state.freeShipping) {
      shipping = <span className='value'>{this.state.shippingMessage}</span>
    }
    return <div className='container'>
      <div className='address-form'>
        <input
          type='text'
          className={`first-name ${this.hasError('firstName')} ${this.hasSuccess('firstName')}`}
          value={this.state.firstName}
          placeholder='First Name'
          onChange={(e) => this.handleAddressChange('firstName')(e)}/>
        <input
          type='text'
          className={`last-name ${this.hasError('lastName')} ${this.hasSuccess('lastName')}`}
          value={this.state.lastName}
          placeholder='Last Name'
          onChange={(e) => this.handleAddressChange('lastName')(e)}/>
        <input
          type='email'
          className={`email ${this.hasError('email')} ${this.hasSuccess('email')}`}
          value={this.state.email}
          placeholder='Email'
          onChange={(e) => this.handleAddressChange('email')(e)}/>
        <input
          type='phone'
          className={`phone ${this.hasError('phone')} ${this.hasSuccess('phone')}`}
          value={this.state.phone}
          placeholder='Phone'
          onChange={(e) => this.handleAddressChange('phone')(e)}/>
        <input
          type='text'
          className={`address ${this.hasError('address1')} ${this.hasSuccess('address1')}`}
          value={this.state.address1}
          placeholder='Address 1'
          onChange={(e) => this.handleAddressChange('address1')(e)}/>
        <input
          type='text'
          className='address'
          value={this.state.address2}
          placeholder='Address 2'
          onChange={(e) => this.handleAddressChange('address2')(e)}/>
        <input
          type='text'
          className={`city ${this.hasError('city')} ${this.hasSuccess('city')}`}
          value={this.state.city}
          placeholder='City'
          onBlur={(e) => this.handleCityBlur(e)}
          onChange={(e) => this.handleAddressChange('city')(e)}/>
        <input
          type='text'
          className='state'
          value={this.state.state}
          placeholder='State'/>
        <input
          type='text'
          className={`zip ${this.hasError('zip')} ${this.hasSuccess('zip')}`}
          value={this.state.zip}
          placeholder='Zip Code'
          onChange={(e) => this.handleAddressChange('zip')(e)}/>
      </div>
      <div className='subtotal'>
        <span className='title'>Subtotal</span>
        <span className='value'>{subtotal}</span>
      </div>
      <div className='taxes'>
        <span className='title'>Taxes</span>
        <span className='value'>{taxes}</span>
      </div>
      <div className='shipping-cost'>
        <span className='title'>Shipping</span>
        {shipping}
      </div>
      <div className='total large'>
        <span className='title'>Total</span>
        <span className='value'>{total}</span>
      </div>
      <div className='next'>
        <div className='get-started'>
          <span className='wrapper'>
            <a onClick={(e) => this.handleConfirmation(e)}>3. CONFIRMATION
              <img src='/assets/cart-next.png'/></a>
          </span>
        </div>
      </div>

      <div className='back'>
        <a href='/checkout-1.html'>
          <img src='/assets/back-arrow.png'/>
          1. ORDER ITEMS
        </a>
      </div>
    </div>
  }
}
