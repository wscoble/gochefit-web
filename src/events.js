var Signal = require('signals').Signal

module.exports = {
  // Browser events
  loadingComplete: new Signal(),


  // User events
  authenticated: new Signal(), // gets AWS.config.credentials
  datasetOpened: new Signal(), // gets the Cognito dataset
  cartDatasetOpened: new Signal(), // gets the Cognito cart dataset
  messageSendRequested: new Signal(), // gets name, email, message
  messageSent: new Signal(), // gets a success message
  messageSendFailed: new Signal(), // gets an error message


  // Tracking events
  track: new Signal(), // gets (data-title, event-name)
  debug: new Signal(), // for debugging


  // Cart events
  cartUpdated: new Signal(), // gets cart object
  cartItemAdded: new Signal(), // gets a cart item
  cartItemDeleted: new Signal(), // gets the cart item id

  // Payment events


  // Error signal
  errored: new Signal(),
}
