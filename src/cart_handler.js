let helpers = require('./helpers')

module.exports = (events) => {
  events.cartDatasetOpened.add((dataset) => {
    let promisifyCallback = (resolve, reject, cb) => {
      return (err, data) => {
        if (err) {
          reject(err)
        } else if (typeof cb === 'function') {
          resolve(cb(data))
        } else {
          resolve(data)
        }
      }
    }

    let getDataset = (name) => {
      return new Promise((resolve, reject) => {
        dataset.get(name, promisifyCallback(resolve, reject, (data) => {
          if (data) {
            return JSON.parse(data)
          }
          return data
        }))
      })
    }

    let putDataset = (name, data) => {
      return new Promise((resolve, reject) => {
        dataset.put(name, JSON.stringify(data), promisifyCallback(resolve, reject))
      })
    }

    let dispatchDebug = (name) => {
      return (value) => {
        return new Promise((resolve, reject) => {
          console.log('calling debug.dispatch with', name, 'and', value)
          events.debug.dispatch(name, value)
          resolve(value)
        })
      }
    }

    let dispatchError = (error) => {
      events.errored.dispatch(error)
    }

    let dispatchCartUpdated = (cart) => {
      events.cartUpdated.dispatch({items: cart, totalItems: helpers.getItemCountFromCart(cart)})
      return cart
    }

    // get existing cart items and dispatch the updated event
    getDataset('items').then(dispatchCartUpdated).then(dispatchDebug('initial cart updated')).catch(dispatchError)

    // wire up cart events

    events.cartItemAdded.add((item) => {
      getDataset('items').then((cart) => {
        if (cart) {
          // update quantity if item already exists in cart
          let itemsHashes = cart.map((i) => i.hash)
          let hashIndex = itemsHashes.indexOf(item.hash)
          if (hashIndex > -1) {
            cart[hashIndex].quantity += item.quantity
          } else {
            cart.push(item)
          }
        } else {
          cart = [item]
        }
        return cart
      })
      .then((cart) => {
        return putDataset('items', cart).then((record) => {
          dataset.synchronize()
          return cart
        })
      })
      .then(dispatchDebug('cart updated'))
      .then(dispatchCartUpdated)
      .catch(dispatchError)
    })

    events.cartItemDeleted.add((itemHash) => {
      getDataset('items')
        .then((cart) => {
          return cart.filter((item) => item.hash !== itemHash)
        })
        .then((cart) => {
          return putDataset('items', cart)
            .then((record) => {
              dataset.synchronize()
              return cart
            })
        })
        .then(dispatchCartUpdated)
        .catch(dispatchError)
    })

    events.cartItemUpdated.add((item, quantity) => {
      getDataset('items')
        .then((cart) => {
          let itemsHashes = cart.map((i) => i.hash)
          let hashIndex = itemsHashes.indexOf(item.hash)
          if (hashIndex > -1) {
            cart[hashIndex].quantity = quantity
          }
          return cart
        })
        .then((cart) => {
          return putDataset('items', cart)
            .then((record) => {
              dataset.synchronize()
              return cart
            })
        })
        .then(dispatchCartUpdated)
        .catch(dispatchError)
    })
  })
}
