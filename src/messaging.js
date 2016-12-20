var MessageWidget = require('./views/message_widget.jsx')
var ReactDOM = require('react-dom')
var React = require('react')


module.exports = function(events) {
  var messageElement = document.getElementById('message-widget');
  if (messageElement) {
    var props = {
      events: events,
      buttonText: messageElement.getAttribute('data-button-text'),
    }
    ReactDOM.render(React.createElement(MessageWidget, props), messageElement)
  }
}
