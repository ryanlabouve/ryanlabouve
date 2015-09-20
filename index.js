var Metalsmith = require('metalsmith');

var markdown   = require('metalsmith-markdown');
var layouts = require('metalsmith-layouts');
var permalinks = require('metalsmith-permalinks');
var inPlace = require('metalsmith-in-place');

var collections = require('metalsmith-collections');

Metalsmith(__dirname)

  .source('./content')
  .destination('./dist')

  .use(collections())

  .use(markdown())


  // .use(function(files, metalsmith, done) {
  //   console.log('FIles: ');
  //   console.log(files);
  //   console.log();
  //   console.log('Metalsmith: ');
  //   console.log(metalsmith);
  // })

  .use(layouts({
    "default": "default.html",
    "engine": "swig"
  }))

  .use(inPlace({
    "engine": "swig",
    "partials": "partials"
  }))

  .use(permalinks({
    "pattern": ":title"
  }))

  .build(function(err) {
    if (err) {
      throw err;
    }
  });
