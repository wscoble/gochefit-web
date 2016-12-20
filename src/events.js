var Signal = require('signals').Signal

module.exports = {
  // Browser events
  loadingComplete: new Signal(),


  // User events
  authenticated: new Signal(), // gets AWS.config.credentials
  datasetOpened: new Signal(), // gets the Cognito dataset
  messageSendRequested: new Signal(), // gets name, email, message
  messageSent: new Signal(), // gets a success message
  messageSendFailed: new Signal(), // gets an error message


  // Tracking events
  track: new Signal(), // gets (data-title, event-name)


  // Cart events
  cartUpdated: new Signal(), // gets cart object
  cartItemAdded: new Signal(), // gets a cart item


  // Payment events


  // Error signal
  errored: new Signal(),
}
