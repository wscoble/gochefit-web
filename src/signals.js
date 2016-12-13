var Signal = require('signals').Signal

module.exports = {
  // User signals
  authenticated: new Signal(), // gets AWS.config.credentials
  datasetOpened: new Signal(), // gets the Cognito dataset

  // Tracking signals


  // Cart signals
  cartUpdated: new Signal(), // gets cart object

  // Payment signals

  // Error signal
  errored: new Signal(),
}
