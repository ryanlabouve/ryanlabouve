---
title: "Ember Problems Infiniscroll with an API"
collection: "posts"
date: "2015-9-27"
link: ember-problems-infiniscroll-with-api
peak: "When you don't want to click next, use infiniscroll to load in data smootly"
---
Instead of clicking next for days, let's hookup infiniscroll! This is part 3 of my 10 part series on Ember Problems.

For this project we'll be using the projects from the last post:

We'll be using [hhff/ember-infinity](https://github.com/hhff/ember-infinity). It's plesantly customizable and looks like it will be supported through the future.

```
ember install ember-infinity
```

https://github.com/hhff/ember-infinity.

## Hooking it up in our route

After installing, let's hook our route up based on the documentation on [hhff/ember-infinity](https://github.com/hhff/ember-infinity).

```
import Ember from 'ember';
import InfinityRoute from "ember-infinity/mixins/route";

export default Ember.Route.extend(InfinityRoute, {
  perPageParam: "meta.pagination.perPage",              // instead of "per_page"
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

Since we don't rely on interactions from our tempalte to advance our model, we can greatly simplify our controller.

```
import Ember from 'ember';

export default Ember.Controller.extend({
  metaData: Ember.computed('model', function() {
    let metadata = this.store.metadataFor('post');
    return Ember.get(metadata, 'pagination');
  }),
});
```

And there you have it, infiniscroll!
