require('dotenv').config();

var metalsmith = require('metalsmith')
var debug = require('metalsmith-debug')
var contentful = require('contentful-metalsmith')
var layouts = require('metalsmith-layouts')
var less = require('metalsmith-less')
var assets = require('metalsmith-assets')
var handlebars = require('handlebars')
var browserify = require('metalsmith-browserify')
var envify = require('envify')
var reactify = require('reactify')
var uglify = require('metalsmith-uglifyjs')

handlebars.registerHelper("math", function(lvalue, operator, rvalue, options) {
    lvalue = parseFloat(lvalue);
    rvalue = parseFloat(rvalue);

    return {
        "+": lvalue + rvalue,
        "-": lvalue - rvalue,
        "*": lvalue * rvalue,
        "/": lvalue / rvalue,
        "%": lvalue % rvalue
    }[operator];
});

handlebars.registerHelper("first_word", function(text) {
  var parts = text.split(" ")
  if (parts.length > 1) {
    return parts[0]
  } else {
    return text
  }
})

handlebars.registerHelper("sans_first_word", function(text) {
  var parts = text.split(" ")
  if (parts.length > 1) {
    parts.shift()
    return parts.join(" ")
  } else {
    return ""
  }
})

metalsmith(__dirname)
  .source('content')
  .destination('build')
  .use(debug())
  .use(contentful({
    access_token: process.env.CONTENTFUL_ACCESS_TOKEN,
    space_id: process.env.CONTENTFUL_SPACE_ID,
    common: {
      header: {
        limit: 1,
        filter: {
          'sys.id[in]': process.env.CONTENTFUL_HEADER_ID
        }
      }
    }
  }))
  .use(layouts({
    engine: 'handlebars',
    partials: 'partials'
  }))
  .use(less())
  .use(assets({
    source: './assets',
    destination: './assets'
  }))
  .use(browserify('js/app.js', [
    './src/index.js'
  ], {
    transform: [envify, reactify]
  }))
  .use(uglify({
    src: ['**/*.js','!**/*.min.js'],
    deleteSources: true,
    uglifyOptions: {
      mangle: true,
      compress: {
        unused: true,
        warnings: false
      }
    }
  }))
  .build(function(err) {
    if (err) {
      throw err
    } else {
      console.log("Successfully built gochefit")
    }
  })
