module.exports = {
  getItemCountFromCart: function(cart) {
    if (typeof cart === 'string') {
      cart = JSON.parse(cart)
    }
    return cart.map(function(item) {
                      return item.quantity
                    }).reduce(function(a, b) {
                      return a + b
                    }, 0)}
}
