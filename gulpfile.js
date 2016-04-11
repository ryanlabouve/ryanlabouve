'use strict';
var gulp = require('gulp');
var chalk = require('chalk');
var fs = require('fs');
var exec = require('child_process').exec;

var autoprefixer = require('autoprefixer');
var browserSync = require('browser-sync').create();
var css = fs.readFileSync('css/app.css', 'utf8');

var cssnext = require('gulp-cssnext');
var postcss = require('gulp-postcss');

var plumber = require('gulp-plumber');
var notify = require("gulp-notify");

var metallog = chalk.white.bgRed.bold;
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
  console.log(metallog('Enter the Metalsmith'));
  exec("node --harmony ./index.js", function(err, stdout, stderr) {
    console.log(chalk.white.bgRed.bold(stdout));
    console.log(chalk.white.bgRed.bold(stderr));
    console.log(chalk.white.bgRed.bold('Leaving the Metalsmith'));
    gulp.start('css', 'copyBowerComponents', 'copyAssets');
  });
});

gulp.task('css', function() {
  return gulp.src("css/app.css")
    .pipe(plumber({
      errorHandler: function(err) {
        console.log(err);
        notify.onError('CSS Pooped the bed. To the logs!');
        this.emit('end');
      }
    }))
    .pipe(postcss([require('postcss-nested')]))
    .pipe(cssnext({
      compress: true
    }))
    .pipe(plumber.stop())
    .pipe(gulp.dest("./dist/css"))
    .pipe(browserSync.stream());
});

gulp.task('copyAssets', function() {
  exec("cp -a assets ./dist");
  exec("cp -a js ./dist");
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
    ['metalsmith', 'css', 'copyBowerComponents', 'copyAssets']);
  gulp.watch('css/**/*', ['css']);
  gulp.watch("dist/*.html").on('change', browserSync.reload);
  gulp.watch("js/*.js", ['copyAssets']);
  gulp.watch('js/*.js').on('change', browserSync.reload);
});

gulp.task('build', ['metalsmith', 'css', 'copyBowerComponents', 'copyAssets']);
gulp.task('default', ['serve', 'watch','metalsmith', 'css', 'copyBowerComponents', 'copyAssets']);
