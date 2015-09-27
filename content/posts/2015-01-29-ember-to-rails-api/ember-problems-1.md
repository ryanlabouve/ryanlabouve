---
title: "Ember Problems: Connecting to Rails-API"
date: 2015-01-29
link: ember-problems-connecting-rails-api
collection: "posts"
peak: "Problem 1: you want to connect Ember-CLI to an actual API Welcome to part 1 of my 10…"
---

> Problem 1: you want to connect Ember-CLI to an actual API

Welcome to part 1 of my 10 part series **Ember Problems**. I wrote down 10 _real problems_ I had when learning ember, and we’ll solve them one by one. We’ll be using exploring them from both Ember-CLI and Rails throughout this series. Today we are going to solve _Connecting Ember to a Rails API._

<style>.embed-container { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; } .embed-container iframe, .embed-container object, .embed-container embed { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }</style><div class='embed-container'><iframe src='https://www.youtube.com/embed/r4H9rnhUyv4' frameborder='0' allowfullscreen></iframe></div>

Here’s all the code for today’s lesson: [github.com/ryanlabouve/todomvc-api](https://github.com/ryanlabouve/todomvc-api/tree/ep1)

## Started with TodoMVC with Ember-CLI

On a [previous tutorial](http://ryanlabouve.com/todomvc-ember-cli/) we build TodoMVC with Ember-CLI. We left off by switching from the fixture adapter (`DS.FixtureAdapter`) to the local storage adapter (`DS.LSAdapter`).

For our tutorial today we are building the most basic Rails API for TodoMVC. Then we are switching our Ember app to use our API via the Active Model Adapter (`DS.ActiveModelAdapter`).

## Building the API

We’re going to use the [rails-api gem](https://github.com/rails-api/rails-api) for the API, because of the gem’s scaffolding generator and Ember compatibility via the [rails-api/active_model_serializers](https://github.com/rails-api/active_model_serializers).

First, make sure you have the rails-api gem installed.

    gem install rails-api

Then create a new rails-api project called [todomvc-api](https://github.com/ryanlabouve/todomvc-api).

    rails-api new todomvc-api
    cd todomvc-api

### Our Specification

Based on the fixtures from TodoMVC, our models have two basic properties that we’ll need.

1.  _[title]_, String: the title of the todo
2.  _[isCompleted]_, String: wheter the todo has been done yet

**WARNING: Ember is camel-cased (e.g. isCompleted) and Rails is underscored (e.g. is_completed). So inside of Rails, use underscores. We’ll see later how the adapter helps both sides resolve this difference.**

So now we’ll actually create the todo resource using the rails-api scaffold.

    rails g scaffold todo title:string is_completed:boolean
    bundle exec rake db:migrate

Now if we boot up our rails server, and look at our new `todo` route,

    rails s
    open http://localhost:3000/todos

we’ll see an empty json array.

![Ember Problems 1: Data After Scaffold](../posts/2015-01-29-ember-to-rails-api/ep1-after-scaffold.png)

### Adding Fake Data

Before we move on, let’s quickly generate some fake data to populate our api using the [faker gem](https://github.com/stympy/faker).

#### Adding Faker to Gemfile

    # Gemfile
    # ...
    gem 'faker'
    # ...

#### Making Seeds

For our fake data we are going to use a little Lorem Ipsum from Faker and then a random `true` or `false` for the `is_completed`.

    # db/seeds.rb
    20.times do
      Todo.create(
        title: Faker::Lorem.words.join(' '),
        is_completed: [true, false].sample
      )
    end

Now we can use rake to run the seeds.

    bundle exec rake db:seed

Now we can refresh `http://localhost:3000/todos` to verify that our seeds works.

![Preview of Seed Data](../posts/2015-01-29-ember-to-rails-api/ep1-data-preview.png)

### Switching to Active Model Serializer

[Active Model Serializer](https://github.com/rails-api/active_model_serializers) is is what we’ll use to craft the JSON that our API returns. We need to do this because Ember expects a certain format for the JSON to be in, and also because we’ll want to strip off un-needed properties from the JSON.

#### Add active_model_serializer to gemfile

    # Gemfile
    # ...
    gem 'faker'
    gem 'active_model_serializers', '~> 0.8.1'
    # ...

_Please note, if you do `gem 'active_model_serializers'` without a version number after it, you are entering a world of pain._

#### Generate serializer

The serializer file, which we are generating, is the file that affects the JSON.

    rails g serializer Todo id title is_completed

Let’s look at the file we just created, `serializers/todo_serializer.rb`. Anything that’s listed in `attributes` is added to the JSON. Anything that’s that’s ommited form `attributes` is left out.

    class TodoSerializer < ActiveModel::Serializer
      attributes :id, :title, :is_completed
    end

Then if we refersh `http://localhost:3000/todos`, we’ll also notice that we have a `todos:` root for our json (which is what Ember expects), and we have ommited all unneeded properties from our objects (i.e. created_at and updated_at).

![After Serializer](../posts/2015-01-29-ember-to-rails-api/ep1-after-serializer.png)

## Switching Ember App to ActiveModelAdapter

So now let’s go back to TodoMVC and switch to using our API.

### Boot Ember with Proxy

Let’s assume that our API will still be running on `http://localhost:3000/` and boot ember using a `--proxy` flag to route all relevant traffic through our api.

    ember serve --proxy http://localhost:3000

### Switch the Adapter

And finally, let’s switch our whole app to run off the API we just built! (Surprise! We only change one line of Ember code).

    import DS from 'ember-data';

    export default DS.ActiveModelAdapter.extend({
    });

Now go to the browser and check it out!

![Todomvc with API](../posts/2015-01-29-ember-to-rails-api/ep1-todomvc.png)

Thanks for joining me on part one of Ember Problems. Next time we’ll be looking at pagination.

### EDIT!: Also, Update the Serializer

Make sure you are using `ActiveModelSerializer` so the names are correctly translating from Ember camelCase style to Rails rails_underscore_style. This will be in `app/serializers/application.js`

    import DS from import DS from 'ember-data';

    export default DS.ActiveModelSerializer.extend({});

Here is the final code: [ryanlabouve/todomvc-embercli/tree/ep1](https://github.com/ryanlabouve/todomvc-embercli/tree/ep1).
