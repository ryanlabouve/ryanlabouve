var Metalsmith = require('metalsmith');

var markdown   = require('metalsmith-markdown');
var prism = require('metalsmith-prism');

var layouts = require('metalsmith-layouts');
var permalinks = require('metalsmith-permalinks');
var inPlace = require('metalsmith-in-place');

var collections = require('metalsmith-collections');

Metalsmith(__dirname)

  .source('./content')
  .destination('./dist')

  .use(collections({
    posts: {
      sortBy: 'date',
      reverse: true
    }
  }))

  .use(markdown({
    langPrefix: 'language-'
  }))

  // .use(prism())

  .use(permalinks({
    pattern: ':title'
  }))

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

  .build(function(err) {
    if (err) {
      throw err;
    }
  });
