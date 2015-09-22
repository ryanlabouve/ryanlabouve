'use strict';
var gulp = require('gulp');
var run = require('gulp-run');
var chalk = require('chalk');
var fs = require("fs");
var exec = require('child_process').exec;

// CSS Junk
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var browserSync = require('browser-sync').create();
var atImport = require("postcss-import");
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

// Metalsmith
gulp.task('metalsmith', function() {
  // this runs metalsmith
  return run('npm start').exec('', function() {
    return gulp.start('css', 'copyBowerComponents');
  });
});

// SCSS
gulp.task('css', function() {
  // var processors = [
  //   atImport(),
  //   autoprefixer({browsers: ['last 1 version']}),
  //   require('postcss-nested'),
  //   require('postcss-simple-vars'),
  //   require('postcss-mixins')
  // ];

  // return gulp.src('css/**/*.css')
  //         .pipe(postcss(processors))
  //         .pipe(gulp.dest('./dist/css'))
  //         .pipe(browserSync.stream());
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

// gulp.task('webserver', function() {
//   gulp.src('dist')
//     .pipe(webserver({
//       livereload: true,
//       port: 9191,
//       open: true
//     }));
// });

gulp.task('default', ['serve', 'watch','metalsmith', 'css', 'copyBowerComponents'])
