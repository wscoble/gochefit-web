/* global $ */
module.exports = (events) => {
  if ($('.checkout-wrapper').length === 0) {
    return
  }

  // we are on the checkout pages, do stuff!
  events.cartUpdated.add((cart) => {
    let items = 'item'
    if (cart.totalItems > 1) {
      items = 'items'
    }
    $('.items-message .green').html(cart.totalItems + ' ' + items)

    // calculate subtotal
    let total = 0
    for (let i = 0; i < cart.items.length; i++) {
      let item = cart.items[i]
      let priceAdjust = 0
      if (item.adjustments.hasOwnProperty('Price')) {
        priceAdjust = parseFloat(item.adjustments.Price)
      }
      total += item.quantity * (parseFloat(item.basePrice) + priceAdjust)
    }
    $('.subtotal .value').html('$' + total.toFixed(2))
  })
}
