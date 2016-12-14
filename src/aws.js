var AWS = require('aws-sdk')
require('amazon-cognito-js')

AWS.config.region = process.env.AWS_REGION

AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: process.env.COGNITO_IDENTITY_POOL_ID
})


module.exports = function(events) {
  AWS.config.credentials.get(function() {
    var lambda = new AWS.Lambda()

    events.authenticated.dispatch(AWS.config.credentials)

    var syncClient = new AWS.CognitoSyncManager()

    syncClient.openOrCreateDataset('chefit', function(err, dataset) {
      if (err) {
        events.error.dispatch(err)
      } else {
        events.datasetOpened.dispatch(dataset)
      }
    })

    events.messageSendRequested.add(function(name, email, message) {
      var params = {
        FunctionName: 'MessageSender',
        InvocationType: 'RequestResponse',
        Payload: JSON.stringify({
          name: name,
          email: email,
          message:message
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
