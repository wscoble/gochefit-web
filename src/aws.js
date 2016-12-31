AWS.config.region = process.env.AWS_REGION

AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: process.env.COGNITO_IDENTITY_POOL_ID
})

var analyticsOptions = {
  appId: process.env.MOBILE_ANALYTICS_APP_ID
}


module.exports = function(events) {
  AWS.config.credentials.get(function() {
    var lambda = new AWS.Lambda()
    events.debug.dispatch(AWS.config.credentials)

    // Analytics setup

    var mobileAnalyticsClient = new AMA.Manager(analyticsOptions)
    mobileAnalyticsClient.startSession()

    window.onbeforeunload = function() {
      mobileAnalyticsClient.stopSession()
    }

    events.track.add(function(source, eventName) {
      mobileAnalyticsClient.recordEvent(eventName, {
        source: source
      })
    })

    // Cognito data setup

    var syncClient = new AWS.CognitoSyncManager()

    syncClient.openOrCreateDataset('chefit', function(err, dataset) {
      if (err) {
        events.errored.dispatch(err)
      } else {
        events.datasetOpened.dispatch(dataset)
      }
    })

    syncClient.openOrCreateDataset('cart', function(err, dataset) {
      if (err) {
        events.errored.dispatch(err)
      } else {
        events.cartDatasetOpened.dispatch(dataset)
      }
    })

    // Message events

    events.messageSendRequested.add(function(name, email, message) {
      var params = {
        FunctionName: 'MessageSender',
        InvocationType: 'RequestResponse',
        Payload: JSON.stringify({
          name: name,
          email: email,
          message: message
        })
      }

      lambda.invoke(params, function(err, data) {
        if (err) {
          events.messageSendFailed.dispatch(err)
        } else {
          events.messageSent.dispatch(data)
        }
      })
    })
  })
}
