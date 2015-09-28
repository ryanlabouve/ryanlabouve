---
title: "Ember Problems Infiniscroll with an API"
collection: "posts"
date: "2015-9-27"
link: ember-problems-infiniscroll-with-api
peak: "When you don't want to click next, use infiniscroll to load in data smootly"
---

Instead of clicking next for days, let's hookup infiniscroll! This is part 3 of my 10 part series on Ember Problems.

For this project we'll be using the projects from the [last post](http://ryanlabouve.com/ember-problems-pagination-with-api):

<style>.embed-container { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; } .embed-container iframe, .embed-container object, .embed-container embed { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }</style><div class='embed-container'><iframe src='https://www.youtube.com/embed//v6BYu9nGz7Q' frameborder='0' allowfullscreen></iframe></div>

We'll be using [hhff/ember-infinity](https://github.com/hhff/ember-infinity). It's pleasantly customizable and looks like it will be supported through the future.

```
ember install ember-infinity
```

https://github.com/hhff/ember-infinity.


### What we need to hook it up

So, here's a rundown of the data we need to make this work. All of these values can be customized, but we only need to do one. Check the documentation if you need to customize more.

<table class="table-light border rounded">
<thead class="bg-darken-1">
<tr>
<th>
Variable
</th>
<th>
Default
</th>
<th>
From our API
</th>
<th>
Direction
</th>
<th>
Description
</th>
</tr>
</thead>
<tbody>
<tr>
<td>
Page Size
</td>
<td>
page_size
</td>
<td>
page_size
</td>
<td>
Sending
</td>
<td>
Size of return payload
</td>
</tr>

<tr>
<td>
Page
</td>
<td>
page
</td>
<td>
page
</td>
<td>
Sending
</td>
<td>
Current index in current dataset
</td>
</tr>

<tr>
<td>
Page
</td>
<td>
meta.total
</td>
<td>
meta.pagination.totalPages
</td>
<td>
Receiving
</td>
<td>
Current pages, given other variables
</td>
</tr>
</tbody>
</table>

## Hooking it up in our route

After installing, let's hook our route up based on the documentation on [hhff/ember-infinity](https://github.com/hhff/ember-infinity).

```
// routes/posts.js
import Ember from 'ember';
import InfinityRoute from "ember-infinity/mixins/route";

export default Ember.Route.extend(InfinityRoute, {
  totalPagesParam: "meta.pagination.totalPages",    // instead of "meta.total_pages"

  model(params) {
    return this.infinityModel('post', {
      perPage: 12,
      startingPage: 1
    });
  }
});
```

## Simplifying our controller

Since we don't rely on interactions from our template to advance our model, we can greatly simplify our controller.

```
import Ember from 'ember';

export default Ember.Controller.extend({
  metaData: Ember.computed('model', function() {
    let metadata = this.store.metadataFor('post');
    return Ember.get(metadata, 'pagination');
  }),
});
```

## The Template
And finally our template:

```
{% raw %}
<div class="clearfix">
  <h1 class="border-bottom py2 center">Posts ({{metaData.total}})</h1>
</div>
{{#each model as |post|}}
  <div class="p2 border-bottom uppercase">
    <div class="bold">{{post.title}}</div>
    <p>
      {{post.body}}
    </p>
  </div>
{{/each}}
{{infinity-loader infinityModel=model destroyOnInfinity=true}}
{% endraw %}
```

And :boom: it's done!
