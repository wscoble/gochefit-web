var AWS = require('aws-sdk')
require('amazon-cognito-js')

AWS.config.region = process.env.AWS_REGION

AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: process.env.COGNITO_IDENTITY_POOL_ID
})


module.exports = function(events) {
  AWS.config.credentials.get(function() {
    events.authenticated.dispatch(AWS.config.credentials)

    var syncClient = new AWS.CognitoSyncManager()

    syncClient.openOrCreateDataset('chefit', function(err, dataset) {
      if (err) {
        events.error.dispatch(err)
      } else {
        events.datasetOpened.dispatch(dataset)
      }
    })
  })
}
