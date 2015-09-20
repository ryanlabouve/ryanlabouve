var Metalsmith = require('metalsmith');

var markdown   = require('metalsmith-markdown');
var layouts = require('metalsmith-layouts');
var permalinks = require('metalsmith-permalinks');

var mustache = require('mustache');

Metalsmith(__dirname)
  .source('./content')
  .destination('./dist')
  
  .use(markdown())
  
  .use(layouts({
    "default": "default.html",
    "engine": "swig"
  }))

  .use(permalinks({
    "pattern": ":title"
  }))
  
  .build(function(err) {
    if (err) {
      throw err;
    }
  });