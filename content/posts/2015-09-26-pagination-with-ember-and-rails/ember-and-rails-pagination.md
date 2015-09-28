---
title: "Ember Problems, Pagination with an API"
date: "2015-09-26"
link: ember-problems-pagination-with-api
collection: "posts"
peak: "When you have truckloads of data, you can't just have once massive payload. Let's talk about how to paginate."
---

Ember Project: https://github.com/ryanlabouve/toy-blog

Rails Project: https://github.com/ryanlabouve/toy-blog-api

<style>.embed-container { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; } .embed-container iframe, .embed-container object, .embed-container embed { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }</style><div class='embed-container'><iframe src='https://www.youtube.com/embed//OJWH-BxNZdo' frameborder='0' allowfullscreen></iframe></div>

## Jumpstart the API 
(If you want to know more about how this is setup, check Ember Problems Episode 1.)

Go ahead and clone up our play API. It's very similar to Episode 1... go ahead and checkout `v0.0.1` if you want to follow along.

```
git clone https://github.com/ryanlabouve/toy-blog-api
cd toy-blog-api
bin/rake db:migrate
git checkout tags/v0.0.1
bundle
bin/rake db:seeds
rails s
```

You should see posts here: `localhost:3000/posts`

And, if you wanna do a little investigation:
```
rails c
Post.all.length # => 2000
```

### Connect to The API

Let's brew up a new ember project for our api. Or, if you would prefer to clone and follow along that way: ryanlabouve/toy-blog

```
ember new toy-blog

// Get the adapter stuff rolling
ember install active-model-adapter
ember generate adapter application
```

And then hook it up to the rails api.
```
// adapters/application.js
import ActiveModelAdapter from 'active-model-adapter';

export default ActiveModelAdapter.extend({
  host: 'http://localhost:3000/'
});
```

Go ahead and generate a model and route for out posts so we can see some magic:

```
ember g model post
ember g route posts
```


Set some basic data about our post in the model. All of these fields were previously generated for our API. Checkout the Api `db/seeds.rb` for more details.

```
// models/post.js
import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  body: DS.attr('string'),
  isDraft: DS.attr('boolean'),
  createdAt: DS.attr('date')
});
```

And then the routes to actually load the data from the Api.
```
// route/posts.js
import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    // This uses our adapter connection and
    // the post model to form the query
    return this.store.find('post');
  }
});
```

And finally the template:

```
{% raw %}
{{! templates/posts.hbs }}
<div class="clearfix">
  <h1 class="border-bottom py2 center">Posts ({{model.length}})</h1>
</div>
{{#each model as |post|}}
  <div class="p2 border-bottom uppercase">
    <div class="bold">{{post.title}}</div>
    <p>
      {{post.body}}
    </p>
  </div>
{{/each}}
{% endraw %}
```

Now we are setup and throwing out 2000 posts on every load. Cool! Let's paginate.

## On to Pagination

### Step 1: API

Instead of one large payload, we'll break it up into smaller indexed chunks. This means that data can load substantially faster, but there has to be an additional layer of logic to manage navigating these chunks.

There are many ways paginate an API... We'll be adding  a 'meta' object, in additional to our root 'post' object, where we'll store meta data about the pagination, like what page we're on and how many results are coming back at one time.

### Adding Kaminari
To simplify break our results into chunks we'll use a gem called [kaminari](#).

> Kaminari is a "sophisticated paginator for modern web app frameworks and ORMs". Let's go ahead and see what this does in `rails console`.

```
# ...
gem 'kaminari'
# ...
```

Let's see what this does: 

```
# inside rails console
Post.all.length # => 2000
Post.page(1).per(10).length # => 10
Post.page(1).per(10) # look at results in console
Post.page(2).per(10).length # => 10
Post.page(2).per(10) # => # look at results in console
```

### Kaminari in Our Post Controller

Using this we can fragment our results instead of listing them all in one return. To move around the whole collection, we'll use query parameters (e.g. `?page=2`).

First, let's chop up our results from our controller.

```
class PostsController < ApplicationController
  # ...
  def index
    page_info = {
      page: params[:page] || 1,
      per_page: params[:per_page] || 5
    }
    @posts = Post.page(page_info[:page]).per(page_info[:per_page])

    render json: @posts, params: page_info
  end
  
  #  ... Other methods
end
```

Now restart all the things and refresh your Ember app. Only showing 5 Posts!

If we look at http://localhost:3000/posts, we'll see that instead of 2000 results we're just getting back 5. And if we change the url to http://localhost:3000/posts?page=3, we'll see a completely different set of `posts`

From the front-end, we now have some problems:
* How do we navigate to these different URLs? (because currently it does not)
* How can we correct "total posts"?

### The Meta Key

Adding The Meta Key in Our Serializer will help us fix most of these issues. It allows us to peek outside the actual payload and look at details we return about the larger collection.

```
class PostSerializer < ActiveModel::Serializer
  attributes :id, :id, :title, :body, :is_draft, :created_at

  def initialize(object, options={})

    meta_key = options[:meta_key] || :meta
    options[meta_key] ||= {}
    
    options[meta_key][:pagination] = {
      page: options[:params][:page].to_i,
      perPage: options[:params][:per_page],
      totalPages: (Post.all.size/options[:params][:per_page].to_f)
    }

    super(object, options)
  end
end
```
See [this stack overflow](http://stackoverflow.com/questions/22947721/rails-active-model-serializer-with-pagination) for a little more discussion on what just happened. There are better ways to do it, but this is simple and good enough for us.

Now if we refersh `http://localhost:3000/posts` we'll see our data with an appropriate meta key.

Armed with this meta data and a hook to navigate around, we have what we need to jump back into ember and hook up pagination.

## Pagination in Ember

Update our route to query and refresh model when changes.
http://guides.emberjs.com/v1.10.0/routing/query-params/#toc_opting-into-a-full-transition

```
import Ember from 'ember';

export default Ember.Route.extend({
  queryParams: {
    page: {
      refreshModel: true
    }
  },
  model(params) {
    return this.store.findQuery('post', params);
  }
});
```

Update our controller to handle query params:

```
import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: [
    'page',
  ],
  page: 1,
  metaData: Ember.computed('model', function() {
    let metadata = this.store.metadataFor('post');
    return Ember.get(metadata, 'pagination');
  }),

  # We're not doing any logic here to manage
  # when we are out of pages
  actions: {
    nextPage() {
      let page = this.get('page');
      this.set('page', page + 1);
    },

    prevPage() {
      this.set('page', this.get('page') - 1);
    }
  }
});
```

And just so we can see what's going on, let's expose that Metadata in the template.

```
{% raw %}
<div class="clearfix">
  <a href="#" class="left btn" {{action "prevPage"}}>&lt; Prev</a>
  <a href="#" class="right btn" {{action "nextPage"}}>Next &gt;</a>
  <h1 class="border-bottom py2 center">Posts ({{metaData.total}})</h1>
  pages: {{metaData.page}} / {{metaData.totalPages}}<br>
</div>
{{#each model as |post|}}
  <div class="p2 border-bottom uppercase">
    <div class="bold">{{post.title}}</div>
    <p>
      {{post.body}}
    </p>
  </div>
{{/each}}
{% endraw %}
```

Next time, we'll look at how to infiniscroll!
