module.exports = function(events) {
  // Once we have a dataset
  events.datasetOpened.add(function(dataset) {
    // set up dataset items
    dataset.get('cart-item-count', function(err, value) {
      if (err) {
        events.errored.dispatch(err)
      } else {
        if (value) {
          events.cartUpdated.dispatch({totalItems: value})
        } else {
          // initialize to 0
          dataset.put('cart-item-count', '0', function (err, record) {
            if (err) {
              events.errored.dispatch(err)
            } else {
              dataset.synchronize()
              events.cartUpdated.dispatch({totalItems: value})
            }
          })
        }
      }
    })

    // When an item is added to the cart
    events.cartItemAdded.add(function (item) {

    })
  })
}
