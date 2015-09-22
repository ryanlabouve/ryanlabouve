'use strict';
var gulp = require('gulp');
var run = require('gulp-run');
var chalk = require('chalk');
var fs = require("fs");
var exec = require('child_process').exec;

var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var browserSync = require('browser-sync').create();
var css = fs.readFileSync("css/app.css", "utf8");

var cssnext = require("gulp-cssnext")

// Static server
gulp.task('serve', function() {
  browserSync.init({
      server: {
          baseDir: "./dist"
      }
  });
});

gulp.task('metalsmith', function() {
  // must run metalsmith with es6 flags
  return run('node --harmony_generators ./index.js').exec('', function() {
    return gulp.start('css', 'copyBowerComponents');
  });
});

gulp.task('css', function() {
  return gulp.src("css/app.css")
    .pipe(cssnext({
      compress: true
    }))
    .pipe(gulp.dest("./dist/css"))
    .pipe(browserSync.stream());
});

gulp.task('copyBowerComponents', function() {
  return exec("cp -a bower_components ./dist");
});

// Post
gulp.task('watch', function() {
  gulp.watch([
    'content/**/*',
    'layouts/**/*',
    'partials/*',
    'index.js'
    ],
    ['metalsmith', 'css', 'copyBowerComponents']);
  gulp.watch('css/**/*', ['css']);
  gulp.watch("dist/*.html").on('change', browserSync.reload);
});

gulp.task('default', ['serve', 'watch','metalsmith', 'css', 'copyBowerComponents'])
