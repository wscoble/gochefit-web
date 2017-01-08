import MessageWidget from './views/message_widget.jsx'
let ReactDOM = require('react-dom')
let React = require('react')
module.exports = (events) => {
  let messageElement = document.getElementById('message-widget')
  if (messageElement) {
    let props = {
      events: events,
      buttonText: messageElement.getAttribute('data-button-text')
    }
    ReactDOM.render(React.createElement(MessageWidget, props), messageElement)
  }
}
