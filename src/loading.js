module.exports = (events) => {
  events.loadingComplete.add(() => {
    console.log('All images are loaded!')
  })
  let images = document.images
  let len = images.length
  let counter = 0
  let isThisTheEnd = () => {
    counter++
    if (counter === len) {
      events.loadingComplete.dispatch(true)
    }
  }
  for (let i = 0; i < len; i++) {
    images[i].addEventListener('load', isThisTheEnd, false)
  }
}
