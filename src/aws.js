/* global AWS, AMA */
AWS.config.region = process.env.AWS_REGION
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: process.env.COGNITO_IDENTITY_POOL_ID
})
let analyticsOptions = {
  appId: process.env.MOBILE_ANALYTICS_APP_ID
}
module.exports = (events) => {
  AWS.config.credentials.get(() => {
    let lambda = new AWS.Lambda()
    events.lambdaAvailable.dispatch(lambda)
    events.debug.dispatch('got aws credentials', AWS.config.credentials)
    // Analytics setup
    let mobileAnalyticsClient = new AMA.Manager(analyticsOptions)
    mobileAnalyticsClient.startSession()
    window.onbeforeunload = () => {
      mobileAnalyticsClient.stopSession()
    }
    events.track.add((source, eventName) => {
      mobileAnalyticsClient.recordEvent(eventName, {
        source: source
      })
    })
    // Cognito data setup
    let syncClient = new AWS.CognitoSyncManager()
    syncClient.openOrCreateDataset('chefit', (err, dataset) => {
      if (err) {
        events.errored.dispatch(err)
      } else {
        events.datasetOpened.dispatch(dataset)
      }
    })
    syncClient.openOrCreateDataset('cart', (err, dataset) => {
      if (err) {
        events.errored.dispatch(err)
      } else {
        events.cartDatasetOpened.dispatch(dataset)
      }
    })
    syncClient.openOrCreateDataset('shipping', (err, dataset) => {
      if (err) {
        events.errored.dispatch(err)
      } else {
        events.shippingDatasetOpened.dispatch(dataset)
      }
    })
    syncClient.openOrCreateDataset('payment', (err, dataset) => {
      if (err) {
        events.errored.dispatch(err)
      } else {
        events.paymentDatasetOpened.dispatch(dataset)
      }
    })
    // Message events
    events.messageSendRequested.add((name, email, message) => {
      let params = {
        FunctionName: 'MessageSender',
        InvocationType: 'RequestResponse',
        Payload: JSON.stringify({
          name: name,
          email: email,
          message: message
        })
      }
      lambda.invoke(params, (err, data) => {
        if (err) {
          events.messageSendFailed.dispatch(err)
        } else {
          events.messageSent.dispatch(data)
        }
      })
    })
  })
}
