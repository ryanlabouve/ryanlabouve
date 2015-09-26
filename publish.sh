#!/bin/bash
git branch -D gh-pages
git push origin --delete gh-pages
git checkout -b gh-pages
gulp build
rm -rf assets bower_components content
rm -rf css layouts partials
rm -rf bower.json gulpfile.js index.js metalsmith.json
mv dist/* .
awk '!/bower_components/' .gitignore > temp && mv temp .gitignore
rm -rf dist
git add .
git commit -m "Publishing to github pages"
git push origin gh-pages
git checkout master
bower i
npm i
