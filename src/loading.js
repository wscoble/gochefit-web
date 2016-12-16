module.exports = function(events) {
  events.loadingComplete.add(function() {
    console.log("All images are loaded!")
  })

  var images = document.images
  var len = images.length
  var counter = 0

  var isThisTheEnd = function() {
    counter++
    if (counter === len) {
      events.loadingComplete.dispatch(true)
    }
  }

  for (var i=0; i<len; i++) {
    images[i].addEventListener('load', isThisTheEnd, false)
  }
}
