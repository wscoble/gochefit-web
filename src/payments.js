/* global Accept */
module.exports = events => {
  events.paymentInfoSaved.add(successful => {
    events.track.dispatch(successful, 'payment info saved')
  })
  events.paymentDatasetOpened.add(dataset => {
    window.acceptResponseHandler = (response) => {
      const data = {
        dataDescriptor: response.dataDescriptor,
        dataValue: response.dataValue
      }
      dataset.put('payment-info', JSON.stringify(data), (err, record) => {
        if (err) {
          events.errored.dispatch(err)
          events.paymentInfoSaved.dispatch(false)
        } else {
          dataset.synchronize({
            onSuccess: () => {
              events.paymentInfoSaved.dispatch(true)
            },
            onFailure: (err) => {
              events.errored.dispatch(err)
              events.paymentInfoSaved.dispatch(false)
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
    }
  })
  events.requestAuthorizePayment.add(data => {
    Accept.dispatchData({
      authData: {
        clientKey: process.env.ACCEPT_CLIENT_KEY,
        apiLoginID: process.env.ACCEPT_API_LOGIN_ID
      },
      secureData: {
        cardData: {
          cardNumber: data.cardNumber,
          month: data.month,
          year: data.year,
          cardCode: data.cvv,
          zip: data.zip,
          fullName: data.fullName
        }
      }
    }, 'acceptResponseHandler')
  })
}
