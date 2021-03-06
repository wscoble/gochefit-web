import React from 'react'

let syncShippingInfoTimeout

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
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address1: '',
      address2: '',
      city: '',
      finalCity: '',
      state: 'NV',
      zip: '',
      specialInstructions: '',
      subtotal: 0.00,
      taxes: 0.00,
      total: 0.00,
      shippingCost: 0.00,
      shippingMessage: '-',
      freeShipping: true,
      errors: ['initial'],
      deliveryDays: [],
      activeDeliveryDay: '',
      promoCode: ''
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

          this.lambdaPromise.then(lambda => {
            const shippingValues = {
              firstName: this.state.firstName,
              lastName: this.state.lastName,
              email: this.state.email,
              phone: this.state.phone,
              address1: this.state.address1,
              city: this.state.city,
              state: this.state.state,
              zip: this.state.zip
            }
            let params = {
              FunctionName: 'ShippingValidator',
              InvocationType: 'RequestResponse',
              Payload: JSON.stringify(shippingValues)
            }
            lambda.invoke(params, (err, result) => {
              if (err) {
                this.props.events.errored.dispatch(err)
              } else {
                const data = JSON.parse(result.Payload)
                this.setState({errors: data['errors']})
              }
            })
          })
        }
      })
    })

    this.lambdaPromise.then(lambda => {
      let params = {
        FunctionName: 'AvailableDeliveryDays',
        InvocationType: 'RequestResponse',
        Payload: ''
      }

      lambda.invoke(params, (err, result) => {
        if (err) {
          this.props.events.errored.dispatch(err)
        } else {
          const data = JSON.parse(result.Payload)
          this.setState({deliveryDays: data})
          setTimeout(() => {
            if (!this.state.activeDeliveryDay !== '') {
              this.setState({activeDeliveryDay: data[0]})
            }
          }, 300)
        }
      })
    })
  }

  componentDidUpdate(prevProps, prevState) {
    let doUpdates = () => {
      this.lambdaPromise.then(lambda => {
        return new Promise((resolve, reject) => {
          let update = {}
          if ((this.state.shippingMessage === '-' || this.state.finalCity !== prevState.finalCity) && this.state.subtotal > 0) {
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
          return new Promise((resolve, reject) => {
            const shippingValues = {
              firstName: this.state.firstName,
              lastName: this.state.lastName,
              email: this.state.email,
              phone: this.state.phone,
              address1: this.state.address1,
              city: this.state.city,
              state: this.state.state,
              zip: this.state.zip
            }
            let params = {
              FunctionName: 'ShippingValidator',
              InvocationType: 'RequestResponse',
              Payload: JSON.stringify(shippingValues)
            }
            lambda.invoke(params, (err, result) => {
              if (err) {
                this.props.events.errored.dispatch(err)
              } else {
                const data = JSON.parse(result.Payload)
                // if any of the returned errors are not the same as the current errors
                if (!this.state.errors.map(error => data.errors.indexOf(error) > -1).reduce((a, b) => a || b, false)) {
                  // if there are no errors in state and in returned errors
                  if (data.errors.length === 0 && this.state.errors.length === 0) {
                    // do not update
                  } else {
                    update['errors'] = data.errors
                  }
                }
                resolve(update)
              }
            })
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
          zip: this.state.zip,
          specialInstructions: this.state.specialInstructions,
          taxes: this.state.taxes,
          subtotal: this.state.subtotal,
          shippingCost: this.state.shippingCost,
          shippingMessage: this.state.shippingMessage,
          total: this.state.total,
          deliveryDay: this.state.activeDeliveryDay
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
    clearTimeout(syncShippingInfoTimeout)
    syncShippingInfoTimeout = setTimeout(doUpdates, 300)
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
    if (this.state.errors.length > 0) {
      alert('Please fix the boxes in red to continue')
    } else {
      window.location.path = '/checkout-3.html'
    }
  }

  changeDeliveryDay(day) {
    this.setState({activeDeliveryDay: day})
  }

  render() {
    let subtotal = this.state.subtotal.toFixed(2)
    let total = this.state.total.toFixed(2)
    let taxes = this.state.taxes.toFixed(2)
    let shipping = <span className='value dollar'>{this.state.shippingMessage}</span>
    if (this.state.shippingCost === 0) {
      shipping = <span className='value'>{this.state.shippingMessage}</span>
    }

    let next = <div className='next'>
      Please fill out the form and choose a delivery day to continue
    </div>
    if (this.state.errors.length === 0 && this.state.activeDeliveryDay !== '') {
      next = <div className='next'>
        <div className='get-started'>
          <span className='wrapper'>
            <a href='/checkout-3.html'>3. CONFIRMATION
              <img src='/assets/cart-next.png'/></a>
          </span>
        </div>
      </div>
    }

    let hasError = (field) => {
      if (this.state.errors.indexOf(field) > -1) {
        return 'error'
      } else {
        return ''
      }
    }

    let hasSuccess = (field) => {
      if (hasError(field) === '') {
        return 'success'
      } else {
        return ''
      }
    }

    let deliveryDays = this.state.deliveryDays.map((day) => {
      let className = 'delivery-day'
      if (this.state.activeDeliveryDay === day) {
        className += ' active'
      }
      return <span className={className} onClick={(e) => this.changeDeliveryDay(day)}>{day}</span>
    })

    return <div className='container'>
      <div className='address-form'>
        <input
          type='text'
          className={`first-name ${hasError('firstName')} ${hasSuccess('firstName')}`}
          value={this.state.firstName}
          placeholder='First Name'
          onBlur={(e) => this.handleAddressChange('firstName')(e)}
          onChange={(e) => this.handleAddressChange('firstName')(e)}/>
        <input
          type='text'
          className={`last-name ${hasError('lastName')} ${hasSuccess('lastName')}`}
          value={this.state.lastName}
          placeholder='Last Name'
          onBlue={(e) => this.handleAddressChange('lastName')(e)}
          onChange={(e) => this.handleAddressChange('lastName')(e)}/>
        <input
          type='email'
          className={`email ${hasError('email')} ${hasSuccess('email')}`}
          value={this.state.email}
          placeholder='Email'
          onBlur={(e) => this.handleAddressChange('email')(e)}
          onChange={(e) => this.handleAddressChange('email')(e)}/>
        <input
          type='phone'
          className={`phone ${hasError('phone')} ${hasSuccess('phone')}`}
          value={this.state.phone}
          placeholder='Phone'
          onBlur={(e) => this.handleAddressChange('phone')(e)}
          onChange={(e) => this.handleAddressChange('phone')(e)}/>
        <input
          type='text'
          className={`address ${hasError('address1')} ${hasSuccess('address1')}`}
          value={this.state.address1}
          placeholder='Address 1'
          onBlur={(e) => this.handleAddressChange('address1')(e)}
          onChange={(e) => this.handleAddressChange('address1')(e)}/>
        <input
          type='text'
          className='address'
          value={this.state.address2}
          placeholder='Address 2'
          onChange={(e) => this.handleAddressChange('address2')(e)}/>
        <input
          type='text'
          className={`city ${hasError('city')} ${hasSuccess('city')}`}
          value={this.state.city}
          placeholder='City'
          onBlur={(e) => this.handleCityBlur(e)}
          onChange={(e) => this.handleAddressChange('city')(e)}/>
        <input
          type='text'
          className={`state ${hasError('state')} ${hasSuccess('state')}`}
          value={this.state.state}
          placeholder='State'/>
        <input
          type='text'
          className={`zip ${hasError('zip')} ${hasSuccess('zip')}`}
          value={this.state.zip}
          placeholder='Zip Code'
          onBlur={(e) => this.handleAddressChange('zip')(e)}
          onChange={(e) => this.handleAddressChange('zip')(e)}/>
        <textarea
          className='special-instructions'
          value={this.state.specialInstructions}
          placeholder='Special Instructions'
          onChange={(e) => this.handleAddressChange('specialInstructions')(e)}/>
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
      <div className='delivery-days-group'>
        <span className='title'>Deliver On</span>
        {deliveryDays}
      </div>
      <div className='promo-code'>
        <input
          type='text'
          placeholder='Promo Code'
          className={`value ${hasError('promo')} ${hasSuccess('promo')}`}
          value={this.state.promoCode}
          onChange={(e) => this.handleAddressChange('promoCode')(e)}/>
      </div>
      <div className='total large'>
        <span className='title'>Total</span>
        <span className='value'>{total}</span>
      </div>

      {next}

      <div className='back'>
        <a href='/checkout-1.html'>
          <img src='/assets/back-arrow.png'/>
          1. ORDER ITEMS
        </a>
      </div>
    </div>
  }
}
