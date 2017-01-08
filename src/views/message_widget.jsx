let React = require('react')

export default class MessageWidget extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      successMessage: null,
      error: false,
      name: '',
      email: '',
      message: ''
    }
  }

  componentDidMount() {
    let self = this
    this.props.events.messageSent.add((successMessage) => {
      self.setState({successMessage: successMessage})
    })

    this.props.events.messageSendFailed.add((errorMessage) => {
      self.setState({error: errorMessage})
    })
  }

  sendMessage() {
    this.props.events.messageSendRequested.dispatch(this.state.name, this.state.email, this.state.message)
  }

  handleNameChange(event) {
    this.setState({name: event.target.value})
  }

  handleEmailChange(event) {
    this.setState({email: event.target.value})
  }

  handleMessageChange(event) {
    this.setState({message: event.target.value})
  }

  render() {
    return <span className='message-widget'>
      <input type='text' name='name' placeholder='Name' onChange={(e) => this.handleNameChange(e)}/>
      <input type='text' name='email' placeholder='Email' onChange={(e) => this.handleEmailChange(e)}/>
      <textarea name='message' placeholder='Message' onChange={(e) => this.handleMessageChange(e)}></textarea>
      <div className='send-message-wrapper'>
        <span className='wrapper'>
          <a onClick={() => this.sendMessage()}>{this.props.buttonText}</a>
        </span>
      </div>
    </span>
  }
}
