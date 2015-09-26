---
title: "Blogging with Metalsmith"
collection: "posts"
peak: I killed wordpress from my stack...
date: "2015-09-29"
link: "blogging-with-metalsmith"
---

I switched from Wordpress to [metalsmith](http://www.metalsmith.io/).

And, instead of having a _behind the curtains_ approach, I decided to just OSS all the things and do it out in the open: [github.com/ryanlabouve/ryanlabouve](https://github.com/ryanlabouve/ryanlabouve).

My biggest goals in switching:

* Easy to author
* Easy to deploy
* Effective version control
* Versital and customizable enough to explore new technology

## Enter Metalsmith

> "An extremely simple, pluggable static site generator."

* Static Site Generator
* Plugins for All the Things
* Very much _chose your own adventure_

Metalsmith is a static site generator written in node. The documentation is not great and most of the tutorials are out of date... so it's hard for me to easily recommend unless you are set on node and wanting to get off the beaten path and/or needing a tool that's flexible enough to customize ultra-customize.

For further exploration, some helpful links:

* http://blog.andyjiang.com/introduction-to-metalsmith/
* http://blakeembrey.com/articles/2014/09/building-a-blog-with-metalsmith/
* http://www.okaythree.com/2015/03/building-a-blog-with-metalsmith/

## Deploy with gh-pages

I have a simple shell script that runs the build scripts and pushes the files to github pages.

Feel free to checkout the [deploy script](https://github.com/ryanlabouve/ryanlabouve/blob/master/publish.sh).

## Gulp for the rough edges

Metalsmith, while a great static site generator, does not cut it, imo, as a build system.

Instead of trying to shoe-horn it into doing so (which is more possible than you'd think) I just used gulp to do additional lifting.

### local development

I use [Browser Sync](http://www.browsersync.io/) to serve my assets during development.

Gulp watches all content and style, running appropriate build tasks as these change

### running metalsmith

I run metalsmith through gulp, and then execute a series of dependent tasks when this finishes (i.e. css and asset related tasks).

### basscss, postcss, and cssnext

Instead of using SASS, I decided to jump on the new hotness and use postcss.

I'm using [basscss](http://www.basscss.com/) for css.

I copy pasta'd the important parts of [BassPlate](https://github.com/basscss/bassplate) to get started and customized from there.

From there I use [cssnext](http://cssnext.io/) and a few other plugins, as you can see [here](https://github.com/ryanlabouve/ryanlabouve/blob/master/gulpfile.js#L36).

### No jQuery or Bootstrap

Since I killed Wordpress, go pure iconoclast and get rid of jQuery and Bootstrap from my blog.

<p class="center serif bold italic mt4">—In Conclusion—</p>

Writing a blog should be a tool for learning and a way to share your knowledge with others. So yah, there are some rough edges, and in the early days I spent more time tweaking my build process than I did writing.
 
