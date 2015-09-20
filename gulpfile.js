'use strict';

var gulp = require('gulp');
var run = require('gulp-run');
var lr = require('gulp-livereload');
var webserver = require('gulp-webserver');
var chalk = require('chalk');

// CSS Junk
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');

// Metalsmith
gulp.task('metalsmith', function() {
  // this runs metalsmith
  run('npm start').exec();
  console.log(chalk.blue('Sweet Jesus, there\'s a fire!'));
});

// SCSS
gulp.task('css', function() {
  var processors = [
    autoprefixer({browsers: ['last 1 version']})
  ];

  return gulp.src('css/**/*.css')
          .pipe(postcss(processors))
          .pipe(gulp.dest('./dist/css'));
});


// Post
gulp.task('watch', function() {
  lr.listen();
  gulp.watch('content/**/*', ['metalsmith']);
  gulp.watch('layouts/**/*', ['metalsmith']);
  gulp.watch('css/**/*', ['css']);
});

gulp.task('webserver', function() {
  gulp.src('dist')
    .pipe(webserver({
      livereload: true,
      port: 9191,
      open: true
    }));
});

gulp.task('default', ['metalsmith', 'watch', 'css', 'webserver'])
