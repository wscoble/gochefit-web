let React = require('react')

export default class QuantityWidget extends React.Component {
  render() {
    return <div className="quantity">
      <img src="/assets/arrow-up.png" className="above" onClick={this.props.handleQtyIncrease}/>
      <span className="value">{this.props.quantity}</span>
      <img src="/assets/arrow-down.png" className="below" onClick={this.props.handleQtyDecrease}/>
    </div>
  }
}
