var Signal = require('signals').Signal

module.exports = {
  // User events
  authenticated: new Signal(), // gets AWS.config.credentials
  datasetOpened: new Signal(), // gets the Cognito dataset

  // Tracking events


  // Cart events
  cartUpdated: new Signal(), // gets cart object

  // Payment events

  // Error signal
  errored: new Signal(),
}
