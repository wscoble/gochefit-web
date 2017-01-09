/* global Accept */
module.exports = events => {
  window.acceptResponseHandler = (response) => {
    console.log('authorize response', response)
    events.paymentInfoReceived.dispatch(response.opaqueData)
  }
  events.requestAuthorizePayment.add(data => {
    Accept.dispatchData({
      authData: {
        clientKey: process.env.ACCEPT_CLIENT_KEY,
        apiLoginID: process.env.ACCEPT_API_LOGIN_ID
      },
      cardData: {
        cardNumber: data.cardNumber,
        month: data.month,
        year: data.year,
        cardCode: data.cvc,
        zip: data.zip,
        fullName: data.fullName
      }
    }, 'acceptResponseHandler')
  })
}
