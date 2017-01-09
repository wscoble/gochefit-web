import React from 'react'
import {isValidCreditCard} from '../helpers'

export default class PaymentWidget extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      fullName: '',
      zip: '',
      cardNumber: '',
      month: '',
      year: '',
      cvc: '',
      errors: [],
      items: [],
      subtotal: 0,
      total: 0,
      taxes: 0,
      shippingMessage: '',
      specialInstructions: ''
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
              shippingName: data.firstName + ' ' + data.lastName,
              shippingAddress1: data.address1,
              shippingAddress2: data.address2,
              shippingCity: data.city,
              shippingState: data.state,
              shippingZip: data.zip,
              shippingPhone: data.phone,
              total: data.total,
              subtotal: data.subtotal,
              taxes: data.taxes,
              freeShipping: data.freeShipping,
              shippingCost: data.shippingCost,
              shippingMessage: data.shippingMessage,
              specialInstructions: data.specialInstructions
            })
          }
        }
      })
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
      update['errors'] = this.state.errors.slice().filter((e) => e !== field)

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
    console.log('Pay triggered!')
  }

  render() {
    console.log('state', this.state)
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

    return <div className='container'>
      <div className='billing-form'>
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
        <span className='pay' onClick={(e) => this.handlePay(e)}>
          <div className='get-started'>
            <span className='wrapper'>
              <a>PAY
                <img src='/assets/cart-next.png'/></a>
            </span>
          </div>
        </span>
      </div>
      <div className='shipping-info'>
        <div className='ship-to'>
          <h3>SHIP TO</h3>
          <p>{this.state.shippingName}</p>
          {address}
          <p>{this.state.shippingCity}, {this.state.shippingState}
            {this.shippingZip}</p>
          <p>{this.state.shippingPhone}</p>
          {specialInstructions}
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
