module.exports = {
  getItemCountFromCart: (cart) => {
    if (cart.length === 0) {
      return 0
    } else {
      return cart.map((item) => item.quantity).reduce((a, b) => {
        return a + b
      }, 0)
    }
  },
  isEmptyObject: (obj) => {
    // null and undefined are "empty"
    if (obj == null) return true
    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0) return false
    if (obj.length === 0) return true
    // If it isn't an object at this point
    // it is empty, but it can't be anything *but* empty
    // Is it empty?  Depends on your application.
    if (typeof obj !== 'object') return true
    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (let key in obj) {
      if (hasOwnProperty.call(obj, key)) return false
    }
    return true
  },
  isValidCreditCard: (value) => {
    // accept only digits, dashes or spaces
    if (/[^0-9-\s]+/.test(value)) return false
    // The Luhn Algorithm. It's so pretty.
    let nCheck = 0
    let bEven = false
    value = value.replace(/\D/g, '')
    for (let n = value.length - 1; n >= 0; n--) {
      let cDigit = value.charAt(n)
      let nDigit = parseInt(cDigit, 10)
      if (bEven) {
        if ((nDigit *= 2) > 9) nDigit -= 9
      }
      nCheck += nDigit
      bEven = !bEven
    }
    return (nCheck % 10) === 0
  }
}
