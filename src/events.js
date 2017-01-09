import Signal from 'signals'
module.exports = {
  // Browser events
  loadingComplete: new Signal(),
  // User events
  authenticated: new Signal(), // gets AWS.config.credentials
  datasetOpened: new Signal(), // gets the Cognito dataset
  lambdaAvailable: new Signal(),
  cartDatasetOpened: new Signal(), // gets the Cognito cart dataset
  shippingDatasetOpened: new Signal(),
  paymentDatasetOpened: new Signal(),
  messageSendRequested: new Signal(), // gets name, email, message
  messageSent: new Signal(), // gets a success message
  messageSendFailed: new Signal(), // gets an error message
  paymentInfoReceived: new Signal(), // gets the Acceptjs Nonce information
  requestAuthorizePayment: new Signal(), // gets the payment information
  // Tracking events
  track: new Signal(), // gets (data-title, event-name)
  debug: new Signal(), // for debugging
  // Cart events
  cartUpdated: new Signal(), // gets cart object
  cartItemAdded: new Signal(), // gets a cart item
  cartItemDeleted: new Signal(), // gets the cart item id
  cartItemUpdated: new Signal(),
  // Payment events
  // Error signal
  errored: new Signal()
}
