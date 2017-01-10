import React from 'react'
import {isValidCreditCard} from '../helpers'

export default class PaymentWidget extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      fullName: '',
      shippingZip: '',
      zip: '',
      cardNumber: '',
      month: '',
      year: '',
      cvc: '',
      errors: [
        'cardNumber', 'month', 'year', 'cvc'
      ],
      items: [],
      subtotal: 0,
      total: 0,
      taxes: 0,
      shippingMessage: '',
      specialInstructions: '',
      paymentAttempted: false,
      paymentErrorMessage: '',
      paymentSuccessMessage: ''
    }
    this.lambdaPromise = new Promise((resolve, reject) => {
      props.events.lambdaAvailable.add((lambda) => {
        resolve(lambda)
      })
    })
    this.paymentDatasetPromise = new Promise((resolve, reject) => {
      props.events.paymentDatasetOpened.add((dataset) => {
        resolve(dataset)
      })
    })
    this.shippingDatasetPromise = new Promise((resolve, reject) => {
      props.events.shippingDatasetOpened.add((dataset) => {
        resolve(dataset)
      })
    })
    this.cartDatasetPromise = new Promise((resolve, reject) => {
      props.events.cartDatasetOpened.add((dataset) => {
        resolve(dataset)
      })
    })
  }

  componentDidMount() {
    this.shippingDatasetPromise.then(dataset => {
      dataset.get('shipping-info', (err, dataStr) => {
        if (err) {
          this.props.events.errored.dispatch(err)
        } else {
          if (dataStr) {
            let data = JSON.parse(dataStr)
            this.setState({
              fullName: data.firstName + ' ' + data.lastName,
              shippingZip: data.zip,
              zip: data.zip
            })
          }
        }
      })
    })

    this.cartDatasetPromise.then(dataset => {
      dataset.get('items', (err, dataStr) => {
        if (err) {
          this.props.events.errored.dispatch(err)
        } else {
          if (dataStr) {
            let data = JSON.parse(dataStr)
            this.setState({items: data})
          }
        }
      })
    })

    this.shippingDatasetPromise.then(dataset => {
      dataset.get('shipping-info', (err, dataStr) => {
        if (err) {
          this.props.events.errored.dispatch(err)
        } else {
          if (dataStr) {
            let data = JSON.parse(dataStr)
            this.setState({
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              shippingName: data.firstName + ' ' + data.lastName,
              shippingAddress1: data.address1,
              shippingAddress2: data.address2,
              shippingCity: data.city,
              shippingState: data.state,
              shippingZip: data.zip,
              zip: data.zip,
              shippingPhone: data.phone,
              total: data.total,
              subtotal: data.subtotal,
              taxes: data.taxes,
              freeShipping: data.freeShipping,
              shippingCost: data.shippingCost,
              shippingMessage: data.shippingMessage,
              specialInstructions: data.specialInstructions,
              deliveryDay: data.deliveryDay
            })
          }
        }
      })
    })

    this.props.events.paymentInfoReceived.add(data => {
      if (data) {
        this.lambdaPromise.then(lambda => {
          let address = this.state.shippingAddress1
          if (this.state.shippingAddress2) {
            address += '\n' + this.state.shippingAddress2
          }

          data['items'] = this.state.items
          data['tax'] = this.state.taxes
          data['shippingCost'] = this.state.shippingCost
          data['customerInfo'] = {
            firstName: this.state.firstName,
            lastName: this.state.lastName,
            email: this.state.email,
            address: address,
            city: this.state.shippingCity,
            state: this.state.shippingState,
            zip: this.state.shippingZip
          }
          data['amount'] = this.state.total.toFixed(2)
          data['command'] = 'payWithCard'

          let params = {
            FunctionName: 'PaymentProcessor',
            InvocationType: 'RequestResponse',
            Payload: JSON.stringify(data)
          }

          lambda.invoke(params, (err, result) => {
            if (err) {
              this.props.events.errored.dispatch(err)
            } else {
              let data = JSON.parse(result.Payload)
              if (data.success) {
                this.paymentSucceeded()
              } else {
                this.setState({paymentErrorMessage: data['errors'][0]['errorText']
                })
              }
            }
          })
        })
      }
    })
  }

  handleAddressChange(field) {
    return (event) => {
      let update = {}
      update[field] = event.target.value
      this.setState(update)
    }
  }

  handleCardChange(field) {
    return (event) => {
      let update = {}
      let value = event.target.value

      update[field] = value
      update['errors'] = this.state.errors.slice().filter((e) => e !== field && e !== 'initial')

      let addError = (field) => {
        update['errors'] = update['errors'].concat([field])
      }

      switch (field) {
        case 'cardNumber':
          let cvc = this.state.cvc
          if (value.length === 15 && cvc.length !== 4) {
            addError('cvc')
          } else if (value.length === 16 && cvc.length !== 3) {
            addError('cvc')
          }
          if (!isValidCreditCard(value) || (value.length !== 15 && value.length !== 16)) {
            addError(field)
          }
          break
        case 'month':
          if (value.length !== 2) {
            addError(field)
          }
          break
        case 'year':
          if (value.length !== 4) {
            addError(field)
          }
          break
        case 'cvc':
          if (this.state.cardNumber.length === 15 && value.length !== 4) {
            addError(field)
          } else if (this.state.cardNumber.length === 16 && value.length !== 3) {
            addError(field)
          } else if (value.length !== 3 && value.length !== 4) {
            addError(field)
          }
      }
      this.setState(update)
    }
  }

  handlePay(event) {
    if (!this.state.paymentAttempted && this.state.errors.length === 0) {
      this.setState({paymentAttempted: true})
      let data = {
        cardNumber: this.state.cardNumber,
        month: this.state.month,
        year: this.state.year,
        cvc: this.state.cvc,
        zip: this.state.zip,
        fullName: this.state.fullName
      }
      this.props.events.requestAuthorizePayment.dispatch(data)
    }
  }

  handlePaypalPay(event) {
    if (!this.state.paymentAttempted) {
      this.setState({paymentAttempted: true})
      this.lambdaPromise.then(lambda => {
        let data = {
          command: 'paypal',
          successUrl: this.props.paypal_success_url,
          cancelUrl: this.props.paypal_cancel_url,
          amount: parseFloat(this.state.total.toFixed(2)),
          items: this.state.items
        }

        let params = {
          FunctionName: 'PaymentProcessor',
          InvocationType: 'RequestResponse',
          Payload: JSON.stringify(data)
        }

        lambda.invoke(params, (err, result) => {
          if (err) {
            this.props.events.errored.dispatch(err)
          } else {
            let data = JSON.parse(result.Payload)
            if (data.hasOwnProperty('errors')) {
              this.setState({paymentErrorMessage: data['errors'][0]['errorText']
              })
            } else {
              this.paymentSucceeded()
            }
          }
        })
      })
    }
  }

  paymentSucceeded() {
    this.setState({paymentSuccessMessage: 'Thank you for your payment!'})
    this.cartDatasetPromise.then((dataset) => {
      return new Promise((resolve, reject) => {
        dataset.remove('items', (err, record) => {
          if (err) {
            this.props.events.errored.dispatch(err)
          } else {
            dataset.synchronize({
              onSuccess: (dataset, newRecords) => {
                window.location.pathname = '/thank-you.html'
              },
              onFailure: (err) => {
                this.props.events.errored.dispatch(err)
              },
              onConflict: (dataset, conflicts, callback) => {
                var resolved = []
                for (var i = 0; i < conflicts.length; i++) {
                  resolved.push(conflicts[i].resolveWithRemoteRecord())
                }

                dataset.resolve(resolved, () => {
                  return callback(true)
                })
              },
              onDatasetDeleted: (dataset, datasetName, callback) => {
                return callback(true)
              },
              onDatasetsMerged: (dataset, datasetNames, callback) => {
                return callback(true)
              }
            })
          }
        })
      })
    })
  }

  tryPayingAgain(event) {
    this.setState({paymentErrorMessage: '', paymentAttempted: false, paymentSuccessMessage: ''})
  }

  render() {
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

    let address = [this.state.shippingAddress1, this.state.shippingAddress2].map((v) => {
      if (v) {
        return <p>{v}</p>
      } else {
        return ''
      }
    })

    let cartItems = this.state.items.map((item) => {
      let price = item.quantity * (parseFloat(item.basePrice) + item.adjustments.Price)
      return <tr>
        <td>{item.name}</td>
        <td>{item.selectedOptions.Size}</td>
        <td>{item.quantity}</td>
        <td>${price.toFixed(2)}</td>
      </tr>
    })

    let specialInstructions = ''
    if (this.state.specialInstructions) {
      specialInstructions = <p><br/>{this.state.specialInstructions}</p>
    }

    let paymentMessage = 'Payment is processing ... One moment please'

    if (this.state.paymentSuccessMessage !== '') {
      paymentMessage = this.state.paymentSuccessMessage
    }

    if (this.state.paymentErrorMessage !== '') {
      paymentMessage = <span>
        <p className='error-message'>{this.state.paymentErrorMessage}</p>
        <div className='get-started' onClick={(e) => this.tryPayingAgain(e)}>
          <span className='wrapper'>
            <a>Try Again</a>
          </span>
        </div>
      </span>
    }

    let payOptions = <span className='pay'>
      {paymentMessage}
    </span>
    if (!this.state.paymentAttempted) {
      payOptions = []
      payOptions.push(
        <span className='pay' onClick={(e) => this.handlePay(e)}>
          <div className='get-started'>
            <span className='wrapper'>
              <a>PAY WITH CARD
                <img src='/assets/cart-next.png'/></a>
            </span>
          </div>
        </span>
      )
      payOptions.push(
        <span className='paypal-pay' onClick={(e) => this.handlePaypalPay(e)}>
          <img
            src='https://www.paypalobjects.com/webstatic/en_US/i/buttons/checkout-logo-medium.png'
            alt='Check out with PayPal'/>
        </span>
      )
    }

    return <div className='container'>
      <div className='billing-form'>
        <img
          className='options-img'
          src='https://www.paypalobjects.com/webstatic/en_US/i/buttons/cc-badges-ppmcvdam.png'
          alt='Buy now with PayPal'/>
        <input
          type='text'
          className={`full-name ${hasError('full-name')} ${hasSuccess('full-name')}`}
          value={this.state.fullName}
          placeholder='Full Name'
          onChange={(e) => this.handleAddressChange('fullName')(e)}/>
        <input
          type='text'
          className={`card-number ${hasError('cardNumber')} ${hasSuccess('cardNumber')}`}
          value={this.state.cardNumber}
          placeholder='Card Number'
          onBlur={(e) => this.handleCardChange('cardNumber')(e)}
          onChange={(e) => this.handleCardChange('cardNumber')(e)}/>
        <input
          type='text'
          className={`month ${hasError('month')} ${hasSuccess('month')}`}
          value={this.state.month}
          placeholder='MM'
          onBlur={(e) => this.handleCardChange('month')(e)}
          onChange={(e) => this.handleCardChange('month')(e)}/>
        <input
          type='text'
          className={`year ${hasError('year')} ${hasSuccess('year')}`}
          value={this.state.year}
          placeholder='YYYY'
          onBlur={(e) => this.handleCardChange('year')(e)}
          onChange={(e) => this.handleCardChange('year')(e)}/>
        <input
          type='text'
          className={`cvc ${hasError('cvc')} ${hasSuccess('cvc')}`}
          value={this.state.cvc}
          placeholder='CVC'
          onBlur={(e) => this.handleCardChange('cvc')(e)}
          onChange={(e) => this.handleCardChange('cvc')(e)}/>
        <input
          type='text'
          className={`zip ${hasError('zip')} ${hasSuccess('zip')}`}
          value={this.state.zip}
          placeholder='Zip Code'
          onBlur={(e) => this.handleAddressChange('zip')(e)}
          onChange={(e) => this.handleAddressChange('zip')(e)}/>
        <span className='total'>
          <span className='title'>Total</span>
          <span className='value'>
            ${this.state.total.toFixed(2)}
          </span>
        </span>
        <div className='back'>
          <a href='/checkout-1.html'>
            <img src='/assets/back-arrow.png'/>
            2. ORDER INFO
          </a>
        </div>
        {payOptions}
      </div>
      <div className='shipping-info'>
        <div className='ship-to'>
          <h3>SHIP TO</h3>
          <p>{this.state.shippingName}</p>
          {address}
          <p>{this.state.shippingCity},&nbsp;{this.state.shippingState}&nbsp;{this.state.shippingZip}</p>
          <p>{this.state.shippingPhone}</p>
          {specialInstructions}
          <p><br/>On {this.state.deliveryDay}</p>
        </div>
        <div className='cart-info'>
          <h3>ITEMS</h3>
          <table>
            <tbody>
              {cartItems}
            </tbody>
          </table>
          <p>Subtotal: ${this.state.subtotal.toFixed(2)}</p>
          <p>Taxes: ${this.state.taxes.toFixed(2)}</p>
          <p>Shipping: {this.state.shippingMessage}</p>
          <p>Total: ${this.state.total.toFixed(2)}</p>
        </div>
      </div>
    </div>
  }
}
