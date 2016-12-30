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

handlebars.registerHelper("toJSON", function(value) {
  return JSON.stringify(value)
})

handlebars.registerHelper('eachJSON', function(context, options) {
  if (!!context) {
    var ret = "";

    for (var key in context) {
      if (context.hasOwnProperty(key)) {
        ret = ret + options.fn({key: key, value: context[key]})
      }
    }

    for(var i=0, j=context.length; i<j; i++) {
      ret = ret + options.fn(c[i]);
    }

    return ret;
  } else {
    return ''
  }
});

var acceptjs

if (process.env.DEVELOPMENT) {
  acceptjs = '<script type="text/javascript" src="https://jstest.authorize.net/v1/Accept.js" charset="utf-8"></script>'
} else {
  acceptjs = '<script type="text/javascript" src="https://js.authorize.net/v1/Accept.js" charset="utf-8"></script>'
}

handlebars.registerPartial('acceptjs', acceptjs)

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
    },
    filterTransforms: {
      include: 10
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
    transform: [envify, reactify],
  }))
  .use(uglify({
    src: ['**/*.js','!**/*.min.js'],
    deleteSources: true,
    uglifyOptions: {
      mangle: true,
      compress: {
        sequences     : true,  // join consecutive statemets with the “comma operator”
        properties    : true,  // optimize property access: a["foo"] → a.foo
        dead_code     : true,  // discard unreachable code
        drop_debugger : true,  // discard “debugger” statements
        unsafe        : false, // some unsafe optimizations (see below)
        conditionals  : true,  // optimize if-s and conditional expressions
        comparisons   : true,  // optimize comparisons
        evaluate      : true,  // evaluate constant expressions
        booleans      : true,  // optimize boolean expressions
        loops         : true,  // optimize loops
        unused        : true,  // drop unused variables/functions
        hoist_funs    : true,  // hoist function declarations
        hoist_vars    : false, // hoist variable declarations
        if_return     : true,  // optimize if-s followed by return/continue
        join_vars     : true,  // join var declarations
        cascade       : true,  // try to cascade `right` into `left` in sequences
        side_effects  : true,  // drop side-effect-free statements
        warnings      : false, // warn about potentially dangerous optimizations/code
        global_defs   : {}     // global definitions
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
