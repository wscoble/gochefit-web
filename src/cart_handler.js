module.exports = function(events) {
  // Once we have a dataset
  events.cartDatasetOpened.add(function(dataset) {
    // set up dataset items
    dataset.get('items', function(err, value) {
      if (err) {
        events.errored.dispatch(err)
      } else {
        var items = JSON.parse(value)
        if (value) {
          events.cartUpdated.dispatch({totalItems: items.map(function(item) {
                                                     return item.quantity
                                                   }).reduce(function(a, b) {
                                                     return a + b
                                                   }, 0)})
        }
      }
    })

    // When an item is added to the cart
    events.cartItemAdded.add(function (item) {

    })
  })
}
