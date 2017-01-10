var Remarkable = require('remarkable')
var Handlebars = require('handlebars')
module.exports = function (handlebars) {
  handlebars.registerHelper('md', function (text) {
    var md = new Remarkable({
      breaks: false,
      html: true,
      langPrefix: 'lang-',
      linkify: true,
      typographer: false,
      xhtmlOut: false
    })
    return new Handlebars.SafeString(md.render(text))
  })
  handlebars.registerHelper("math", function (lvalue, operator, rvalue,
    options) {
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
  handlebars.registerHelper("first_word", function (text) {
    var parts = text.split(" ")
    if (parts.length > 1) {
      return parts[0]
    } else {
      return text
    }
  })
  handlebars.registerHelper("sans_first_word", function (text) {
    var parts = text.split(" ")
    if (parts.length > 1) {
      parts.shift()
      return parts.join(" ")
    } else {
      return ""
    }
  })
  handlebars.registerHelper('toJSON', function (value) {
    return JSON.stringify(value)
  })
  handlebars.registerHelper('eachSection', function (list, section, options) {
    var filteredList = list.filter(function (e) {
      return e.fields.section === section
    })
    ret = ''
    for (var i = 0; i < filteredList.length; i++) {
      ret += options.fn(filteredList[i])
    }
    return ret
  })
  var acceptjs
  if (process.env.PRODUCTION) {
    acceptjs =
      '<script type="text/javascript" src="https://js.authorize.net/v1/Accept.js" charset="utf-8"></script>'
  } else {
    acceptjs =
      '<script type="text/javascript" src="https://jstest.authorize.net/v1/Accept.js" charset="utf-8"></script>'
  }
  handlebars.registerPartial('acceptjs', acceptjs)
}
