#!/bin/bash
git branch -D gh-pages
git push origin --delete gh-pages
git checkout -b gh-pages
gulp build
git rm -rf assets bower_components content
git rm -rf css layouts partials
git rm -rf bower.json gulpfile.js index.js metalsmith.json
mv dist/* .
rm -rf dist
git add .
git commit -m "Publishing to github pages"
git push origin gh-pages
git checkout master
