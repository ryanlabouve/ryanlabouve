---
title: "Gulp for CSS: Getting Sophisticated"
collection: "posts"
link: gulp-for-css-pt2
peak: "Different development and production stylesheets Development: easy to debug Production: minified Start automating repetitive tasks I recently evangelized…"
date: "2014-11-27"
---

*   Different development and production stylesheets
    *   Development: easy to debug
    *   Production: minified
*   Start automating repetitive tasks

I [recently evangelized](http://ryanlabouve.com/sophisticating-your-css/) using a task runner as a necessity in your front-end workflow.

In [part 1](http://ryanlabouve.com/gulp-for-css-part-1) we installed Gulp, compiled SASS, and set up a local server with live reload. Now let’s focus on separating development and production stylesheets; optimizing development for rapid changes and debugging, and production to be as small as possible.

Here’s where we left off last time: [Code Checkpoint](https://github.com/ryanlabouve/gulp-for-css/releases/tag/v0.5)

## Separate Development from Production

Make an independent `build` task.

```
    // gulpfile.js
    // requires...
    // tasks...
    gulp.task('build', ['sass']);
    gulp.task('default', ['sass', 'watch', 'connect']);
```

Our default task will continue to take advantage of LiveReload and Watch for development. The `build` task will allow us to reuse certain tasks and include different production-specific tasks.

### Production CSS

#### Minification for Production

Production is all about speed. Our CSS doesn’t need comments or spaces, or even to be human readable.

As many projects do, we’ll aim to produce a `app.min.css` inside a `dist/css` folder.

We’ll use [gulp-minify-css](https://www.npmjs.org/package/gulp-minify-css/) to minify the css and [gulp-rename](https://www.npmjs.org/package/gulp-rename/) to rename the file with a `.min` suffix.

Our `dist/css` folder should have both a minified and un-minified version, so the unminified version could be used as a reference.

    npm install gulp-minify-css --save-dev
    npm install gulp-rename --save-dev

We’ll make a new task called `sass-minify` to take `css/app.css` from our original `sass` task, rename it, and minify it.

Only add `sass-minify` to our `build` task, since we don’t need to generate these files in development.

    // gulpfiles.js
    // Requires...

    gulp.task('sass-minify', function() {
        return gulp.src('css/app.css')
            // First, save the unminified version
            .pipe(gulp.dest('dist/css'))
            // Now rename
            .pipe(rename({suffix: '.min'}))
            // Actually minify the file
            .pipe(minifycss())
            // And then save it again with its new name
            .pipe(gulp.dest('dist/css'));
    });

    //Tasks...

    // be sure sass-minify happens after sass
    gulp.task('build', ['sass', 'sass-minify']);
    //...

Now you can run `gulp build` and verify the output in `dist/css`.

### Development CSS

#### Linting our SCSS

In development linting encourages/enforces coding in a specific style.

We’ll use [gulp-css-lint](https://www.npmjs.org/package/gulp-scss-lint) to do the linting.

    npm install gulp-scss-lint --save-dev

CSS has a lot of opinions about style and not a lot of rules. So we’ll have to do a bit of configuration to get our linter to report the errors we want.

By default, the `gulp-css-lint` plugin uses this yml file: [github.com/causes/…/config/default.yml](https://github.com/causes/scss-lint/blob/master/config/default.yml).

I’ve customized mine a bit. You can see it here: [scss-lint.yml](https://github.com/ryanlabouve/gulp-for-css/blob/master/.scss-lint.yml). This goes in the root of the project.

You’ll probably want to customize this as well. It doesn’t have to be perfect right away. Just make tweaks as you go and aim to keep your CSS as consistent as possible.

If you are looking for some guidance on how your css should be formatted, check out [idiomatic css](https://github.com/necolas/idiomatic-css) or [cssguidelin.es](http://cssguidelin.es/).

    // gulpfile.js
    //...
    gulp.task('sass-lint', function() {
        return gulp.src('scss/app.scss')
            .pipe(scss({
                'config': '.scss-lint.yml'
            }));
    });
    //..

## Automation

At this point we have completely different branches of tasks for development and production. Here’s a [code checkpoint](https://github.com/ryanlabouve/gulp-for-css/releases/tag/v0.6).

Our next step is to start automating things to make authoring easier and faster.

### Autoprefixer

Let’s start with auto-prefixing.

Auto-prefixing means automatically applying vendor prefixes to your code, which allows you to use newer CSS features (like flexbox, transition, and transform) in modern browsers.

> …the point of vendor prefixes was to allow browser makers to start supporting experimental CSS declarations. [source](http://www.quirksmode.org/blog/archives/2010/03/css_vendor_pref.html#link1)

Vendor prefixes, good or bad, are still a reality of authoring css. Applying these things manually is a terrible hassle.

Instead of writing:

    .effect {
        transform: rotate(10deg) rotateY(50deg);
        transition: all 0.3s ease-in;
    }

We are forced to write:

    .effect {
      -webkit-transform: rotate(10deg) rotateY(50deg);
         -moz-transform: rotate(10deg) rotateY(50deg);
              transform: rotate(10deg) rotateY(50deg);
      -moz-transition: all 0.3s ease-in;
           transition: all 0.3s ease-in;
    }

But using autoprefixer, this code gets generated for us automatically.

So let’s get this installed, require the module, and then add it to our sass task.

    npm install gulp-autoprefixer --save-dev

    // gulpfile.js
    // requires...
    var autoprefixer = require('gulp-autoprefixer');

    // tasks...
    gulp.task('sass', function() {
        return sass('scss/app.scss', {
            'sourcemap': true,
            'style': 'expanded',
            'lineNumbers': true
        })
        // This one line is all it takes in our task to get it working
        .pipe(autoprefixer({ browsers: ['last 2 version', 'Firefox < 20', '> 5%'] }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('css'))
        .pipe(connect.reload());
    });

And now our development and production code will be automatically vendor prefixed during the `sass` task.

Here’s information on how to target [other browsers](https://github.com/postcss/autoprefixer#browsers).

Next time in part 3 we’ll look at how we can expand our automation to include features for our HTML, Assets, and Javascript using the same patterns we used to get our CSS tasks setup.
