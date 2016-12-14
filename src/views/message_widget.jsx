var React = require('react')

module.exports = React.createClass({
  getInitialState: function() {
    return {
      successMessage: null,
      error: false,
      name: '',
      email: '',
      message: '',
    }
  },

  componentDidMount: function() {
    var self = this
    this.props.events.messageSent.add(function(successMessage) {
      self.setState({successMessage: successMessage})
    })

    this.props.events.messageSendFailed.add(function(errorMessage) {
      self.setState({error: errorMessage})
    })
  },

  sendMessage: function() {
    this.props.events.messageSendRequested.dispatch(
      this.state.name,
      this.state.email,
      this.state.message
    )
  },

  handleNameChange: function(event) {
    this.setState({name: event.target.value})
  },

  handleEmailChange: function(event) {
    this.setState({email: event.target.value})
  },

  handleMessageChange: function(event) {
    this.setState({message: event.target.value})
  },

  render: function() {
    var itemsText = 'Items'
    if (this.state.items === 1) {
      itemsText = 'Item'
    }
    return <span className='message-widget'>
             <input type='text' name='name' placeholder='Name' onChange={this.handleNameChange} />
             <input type='text' name='email' placeholder='Email' onChange={this.handleEmailChange} />
             <textarea name='message' placeholder='Message' onChange={this.handleMessageChange}></textarea>
             <div className='send-message-wrapper'>
               <span className='wrapper'>
                 <a onClick={this.sendMessage}>{this.props.buttonText}</a>
               </span>
             </div>
           </span>
  }
})
