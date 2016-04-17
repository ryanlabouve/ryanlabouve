# Ember JWT Toy Blog

Goal:

> Serve an API backed blog with Public (availible to everyone) and Private posts (have to log in to see).

##### Notes:

* We'll be using [Ember Simple Auth](https://github.com/simplabs/ember-simple-auth) for authentication
* Our API was built in [this previous tutorial](http://ryanlabouve.com/jwt-rails-api-challenge/).
* Authentication is done with JWT (json web tokens)
* Our data JSONAPI compliant
* We'll use Mirage to mock the API for testing
* We'll use Bootstrap 4 to spiffy things up with minimal hassle

Let's get started! `ember new ember-jwt-toy-blog`.

## The Prototype

### Rough sketch of what we're making
![Our Prototype](/Users/luckyrye/Desktop/prototype.jpg)

__Public Posts__

* List of public posts on left

__User Login__

* *User not logged in–* show a login form
* *User logged in–* show a button to log out in place of the form


__Private Posts__

* *User not logged in–* show a notice to login
* *User logged in–* Show a lists of posts

To talk about this in terms of components:

![Our Prototype w/Components](/Users/luckyrye/Desktop/prototype-components.jpg)

* `{{public-posts}}` — A list of all public posts
* `{{blog-post}}` — A single post
* `{{login-form}}` — A form to help users login / logout
* `{{private-posts}}`— A list of all private posts

## Mocking The Backend & TDD for Public Posts

### Installing and Confirugring Mirage

```
ember install ember-cli-mirage@beta
```

We'll start by configuring mirage to handle our public posts. 

> Mirage is simply fake version of our API that we can use for testing and development. Read more [here](http://www.ember-cli-mirage.com/). 

We'll need to create a `publicPost` table and a `publicPost` factory to start returning fake posts to our tests. 

> Mirage models create _tables_ in Mirage's in memory database, while factories are the blueprints for what the data should look like in those tables.

We'll be creating factories and models `publicPosts`, and `users`.

```
ember g mirage-model publicPost
ember g mirage-factory publicPost
```

We don't have to do anything with the model out of the box.

For the factory, we'll need to describe what kind of data we'll want back. This should make the Schema from the API `Post(title:string, body:text, type:string)`.

```
// mirage/factories/public-post.js
import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
  body: faker.lorem.words(),
  title: faker.lorem.paragraphs(),
  createdAt: faker.date.past()
});
```

> Mirage is using [faker](https://github.com/FotoVerite/Faker.js), which can be used to generate realistic fake data for our tests. 

Similar to our `router.js` or for rails `router.rb`, we'll need to specify a mapping between requests and what's returned.

```
// mirage/config.js
export default function() {
  this.get('/public-posts');
}
```

> To better understand what Mirage is doing here, I recommend reading [the concerning docs](http://www.ember-cli-mirage.com/docs/v0.2.0-beta.8/route-handlers/) or more specifically about the [shorthands](http://www.ember-cli-mirage.com/docs/v0.2.0-beta.8/shorthands/), which allow for such expressive statements.

Now that we've modeled `PublicPosts` from the backend, let's move on to write some acceptance tests to help us implement `PublicPosts` on the front-end.

#### Acceptance Test for Public Posts

```
ember g acceptance-test public-posts-test
```

And from the generator, we'll write a test that will have Mirage generate 5 `PublicPosts` and then verify that they are written out on the page.

```
import { test } from 'qunit';
import moduleForAcceptance from 'ember-jwt-toy-blog/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | public posts');

test('public-posts on /', function(assert) {
  visit('/');
  // create 5 fake posts from mirage
  server.createList('public-post', 5);

  andThen(function() {
    // uncomment `pauseTest();` to see a preview 
    // of our progress along the way
  	 // pauseTest();
    assert.equal(
      find('.public-post').length,
      5,
      'we can see all the public posts from /'
    );
  });
});
```

And now if we `ember serve` and visit `http://localhost:3000/tests`, Yay! Failing test!

#### Implement `PublicPosts`

I prefer to naaively work from the router down, so I'll start by generating the application route and trying ot pass in `PublicPosts` through the model hook.

```
ember g route application
```

And then...


```
// app/routes/application.js
import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    return this.store.findAll('publicPost');
  }
});
```

Here, we've knowingly thrown an error because we don't have a `publicPost` model availible. So let's go ahead and fix that.

`ember g model publicPost`

Since we know what attributes we're supposed to have on the model, let's dive down a level and write a unit test
```
// test/unit/models/public-post.js
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('public-post', 'Unit | Model | public post', {
});

// There are the only keys we are expecting on the model
const expectedKeys = [
  'title',
  'body',
  'createdAt'
];

test('it has the right keys', function(assert) {
  let model = this.subject();
  const modelKeys = Object.keys(model.toJSON());
  
  // Test for the existence of individual keys
  modelKeys.forEach(function(key) {
    assert.equal(
      expectedKeys.indexOf(key) > -1,
      true,
      `public post should have a ${key} property`
    );
  });

  // Test that we have the right number of keys
  assert.equal(
    expectedKeys.length,
    modelKeys.length,
    `We are expecting ${expectedKeys.lenght} props and we have ${modelKeys.length} on the model`
  );
});
```
Now let's lock the tests to `Unit | Model | public post` and get'em green.

```
import Model from 'ember-data/model';
import attr from 'ember-data/attr';

export default Model.extend({
  title: attr('string'),
  body: attr('string'),
  createdAt: attr('date')
});
```

![Model tests in testem](/Users/luckyrye/Desktop/green-model-tests.jpg)

And now we can go back to filter for all...

And make them pass

```
// app/templates/application.hbs
{{#each model as |post|}}
  <div class="public-post">
    {{post.title}}
  </div>
{{else}}
  No Public Posts Found!
{{/each}}
```

:boom: passing tests!

> show from `pauseTest();` and make note about how there is currenlty nothing on `http://localhost:4200`.

([code checkpoinst]())

Let's take a moment to refactor towards the component strucutre we decided on about for `{{public-post}}`.

#### {{public-post}}: Minor Refactor #1

```
ember g component public-posts --pod
```

```
// app/templates/application.hbs
{{public-posts posts=model}}
```

```
// app/components/public-post/template.hbs
{{#each posts as |post|}}
  <div class="public-post">
    {{post.title}}
  </div>
{{else}}
  No Public Posts Found!
{{/each}}
```

:boom: Passing tests!

([code checkpoinst]())

And now let's make one more refactor for our `{{blog-post}}` component.

#### {{blog-post}} Minor Refactor #2
```
ember g component blog-post --pod
```
```
// app/components/public-post/template.hbs
{{#each posts as |post|}}
  {{blog-post title=post.title body=post.body}}
{{else}}
  No Public Posts Found!
{{/each}}
```

```
// app/components/blog-post/template.hbs
<div class="blog-post">
  <h5>
    {{title}}
  </h5>
  <div>
    {{body}}
  </div>
</div>

```

YAY! Green tests.

([code checkpoinst]())


## Cut over to live API

Let's go ahead and cut over to our live api for a sanity check on our progress. This is the one we made in [this tutorial](http://ryanlabouve.com/jwt-rails-api-challenge/), which I'm going to assume is running on `http://localhost:3000`.

> If setting up the API is an issue, please let me know on twitter [@ryanlabouve](http://twitter.com/ryanlabouve) and I'd be happy to deploy to heroku and swap tutorial to use external link

```
ember g adapter application
```

By default, this is [DS.JSONAPIAdapter](http://emberjs.com/api/data/classes/DS.JSONAPIAdapter.html), which is what we want.

Inside the environment, we'll want to configure our host name (i.e. `http://localhost:3000`) and make sure Mirage is only turned on for the test environment.

```
// config/environment.js

// Disable mirage by default
ENV['ember-cli-mirage'] = {
  enabled: true
};

if (environment === 'development') {
  ENV.host = 'http://localhost:3000';
}

if (environment === 'test') {
  // remove host address for tests
  // so the paths display omits the url
  ENV.host = '';
  
  // Turn on mirage only for testing
  ENV['ember-cli-mirage'] = {
    enabled: true
  };
}
```

Then inside the generated adapter.

```
import JSONAPIAdapter from 'ember-data/adapters/json-api';
import config from '../config/environment';

export default JSONAPIAdapter.extend({
  // the host is pulled from the `config/environment.js`
  host: config.host
});
```

And now if we look at our browser, we should see a lot of posts loading from the api!
![Posts](/Users/luckyrye/Desktop/EmberJwtToyBlog.jpg)

Woot!

## Setting up Ember Simple Auth

### Ember Simple Auth

Let's install Ember Simple Auth (ESA), configure mirage to mock our particular authentication strategy, and then TDD the implementation.

1. Install addon

`ember install ember-simple-auth`

2. Extend mirage to mock/stub auth
3. Setup acceptance test for login and logout
4. Implement login form to verify everythign is passing
  * login form & actions
  * config
  * authenticator
  * authorizer

### Extend mirage to handle auth

We'll need to customeize ESA to how our API handles authentication. To guide our cutomization, we are going to make mirage act like our server does currently, and TDD our way through, so even when things are tricky we have a good feedback loop.

#### Using Authenticators to Request our Token

In vanilla CURL language, to request a token we need to `POST` to a specified endpoint, with our username and password in a specified format.

In our case, that means:

```
POST http://localhost:3000/knock/auth_token
{ "auth" : { "email": "lester@tester.com", "password" : "test1234" }}
```

If it's sucessful, we'll get back a `201 Created` along with the token associated to our user.

```
201 Created
{ "jwt" : "token123456789" }
```

If the username and password are incorrect we'll get a `404`.

Simulating this in mirage looks like this:

```
this.post('/knock/auth', (db, request) =>  {
  const req = JSON.parse(request.requestBody);
  const pw = Ember.get(req, 'auth.password');

  if(pw === 'test1234') {
    return new Mirage.Response(201, {}, { jwt: 'hotdog' });
  } else {
    return new Mirage.Response(404, {}, {});
  }
});
```

#### Using that token to make requests

And when we make requests, we pass the token

```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9
GET /private-posts
```

Assuming our token is correct, the request will process normally. If the token is invalid, then we'll get a `401 Unauthorized`.

To simulate this in mirage, we'll do

```
  // mirage/config.js
  ...
  
  this.get('/private-posts', ({ privatePost }, request) => {
    const token = Ember.get(request, 'requestHeaders.Authorization');
    if (token === 'hotdog') {
      return privatePost.all();
    } else {
      return new Mirage.Response(401, {}, {});
    }
  });
  ...
```

#### Mirage for our PriavtePosts

We'll repeat the process early for getting the `PrivatePost` resource setup in mirage.

```
ember g mirage-model privatePost
ember g mirage-factory privatePost
```

And again, this should make the Schema from the API `PrivatePost(title:string, body:text, type:string)`.

```
// mirage/factories/private-post.js
import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
  body: faker.lorem.words(),
  title: faker.lorem.paragraphs(),
  createdAt: faker.date.past()
});

```

### Acceptance Test Customizing our Auth

To create a tight feedback loop, we'll go ahead and work on `{{login-form}}`, since this will be able to quickly hit logging  in and out.

Here are the main cases we want to handle:

* If a user is not logged in, they see a login form
* If a user is logged in, they see a logout button
* If a user logs in, they go from seeing a login from to a logout button
* If a user logs out, they go from seeing a logout button to a login form
* If a user puts in the wrong login credientials, they see a login error

> This process seems tedious, but focusing on TDD our way through helps us keep focus and make consistent progress on a good path.

```
import { test } from 'qunit';
import moduleForAcceptance from 'ember-jwt-toy-blog/tests/helpers/module-for-acceptance';

// These test helps are included with ESA, and
// are absolutely critical for sane testing.
import {
  currentSession,
  invalidateSession ,
  authenticateSession
} from 'ember-jwt-toy-blog/tests/helpers/ember-simple-auth';

moduleForAcceptance('Acceptance | login');

test('If a user is not logged in, they see a login form', function(assert) {
  invalidateSession(this.application);
  visit('/');

  andThen(function() {
    const loginFormPresent = find('#loginForm').length > 0 ? true : false;
    assert.equal(loginFormPresent, true);
  });
});

test('a non-rando sees a current-user info', function(assert) {
  authenticateSession(this.application);
  visit('/');

  andThen(function() {
    assert.equal(currentURL(), '/');
    const logoutBtnPresent = this.$('.logoutBtn').length > 0 ? true : false;
    assert.equal(
      logoutBtnPresent,
      true,
      'An authed user should see the logout button'
    );

    const loginFormPresent = find('#loginForm').length > 0 ? true : false;
    assert.equal(
      loginFormPresent,
      false,
      'An authed user not should see the login form'
    );
  });
});

test('user can logout', function(assert) {
  authenticateSession(this.application);
  visit('/');
  click('.logoutBtn');

  andThen(() => {
    const sesh = currentSession(this.application);
    const isAuthed = Ember.get(sesh, 'isAuthenticated');
    assert.equal(
      isAuthed,
      false,
      'After clicking logout, the user is no longer logged in'
    );

  });
});

test('user can login', function(assert) {
  invalidateSession(this.application);
  visit('/');

  fillIn('.username-field', 'lester@test.com');
  fillIn('.password-field', 'test1234');
  click('.login-btn');

  andThen(() => {
    const sesh = currentSession(this.application);
    const isAuthed = Ember.get(sesh, 'isAuthenticated');
    assert.equal(
      isAuthed,
      true,
      'after a user submits good creds to login form, they are logged in'
    );
  });
});

test('user can fail to login', function(assert) {
  invalidateSession(this.application);
  visit('/');

  fillIn('.username-field', 'lester@test.com');
  fillIn('.password-field', 'wrongPassword');
  click('.login-btn');

  andThen(() => {
    const sesh = currentSession(this.application);
    const isAuthed = Ember.get(sesh, 'isAuthenticated');
    assert.equal(
      isAuthed,
      false,
      'User submits bad username and password, fails'
    );

    isShowingLoginFails = find('.login-err').length > 0 ? true : false;
    assert.equal(
      isShowingLoginFails,
      true,
      'Shows user an error when they put in bad deets'
    );
  });
});
```

#### Authenticator

#### Authorizor


### Test driving the next few features

`ember g acceptance-test private-post`

Acceptance test for seeing "must log in first to see private posts"


```
import { test } from 'qunit';
import moduleForAcceptance from 'ember-jwt-toy-blog/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | private posts');

test('private-posts on /', function(assert) {
  visit('/');
  server.createList('private-post', 5);

  andThen(function() {
    assert.equal(
      find('.private-post').length,
      0,
      'We cannot see any private posts if we don\'t login'
    );
  });
});
```


Acceptance test for seeing "


### Private Posts


TODO: Usefule for testing auth stuff? http://www.slideshare.net/BenLimmer/automated-testing-in-emberjs

TODO: http://www.slideshare.net/mixonic/testing-ember-apps-managing-dependency <- make a point to use

http://www.slideshare.net/bantic/ember-testing-internals-with-ember-cli

https://madhatted.com/2014/8/29/testing-ember-js-apps-managing-dependencies

http://kellysutton.com/2015/02/17/unit-testing-ember-controllers-backed-by-ember-data.html

## TDD the rest of the things
### Public Posts

First, we'll move the list of posts into their own component.
```
ember g component public-posts --pod
```

```
<div class="list-group">
  <div class="list-group-item">
    <div class="lead">Public Posts</div>
  </div>
  {{#each posts as |post|}}
    <div class="list-group-item public-post">
      <h5 class="list-group-item-heading">
        {{post.title}}
      </h5>
      <div class="list-group-item-text">
        {{post.body}}
      </div>
    </div>
  {{else}}
    No Public Posts Found!
  {{/each}}
</div>
```

TODO something with component test

At this point, our tests are still passing.

Now let's move posts into their own components

```
ember g component blog-post --pod
```

```
{{! app/components/public-post/template.hbs }}
<div class="list-group">
  <div class="list-group-item">
    <div class="lead">Public Posts</div>
  </div>
  {{#each posts as |post|}}
    {{blog-post
      title=post.title
      body=post.body
      testClass='public-post'
      }}
  {{else}}
    No Public Posts Found!
  {{/each}}
</div>
```

and

```
{{! app/components/blog-post/template.hbs }}
<div class="list-group-item {{testClass}}">
  <h5 class="list-group-item-heading">
    {{title}}
  </h5>
  <div class="list-group-item-text">
    {{body}}
  </div>
</div>
```


### BootStrap

Add bootstrap (quick and dirty method):
```
<link rel="stylesheet" href="https://cdn.rawgit.com/twbs/bootstrap/v4-dev/dist/css/bootstrap.css" >
```

For icons...

`ember install ember-font-awesome`

### Layout

Here's we'll just push things around in generally the right spot.

```
// app/templates/application.hbs
<div class="container">
  <div class="row header">
    <div class="col-sm-6">
      <h1>Posts</h1>
    </div>
    <div class="col-sm-6">
      {{current-user}}
    </div>
  </div>

  <div class="row body">
    <div class="col-sm-6">
     {{public-posts}}
     {{! We'll move this block inside public-posts in a sec}}
     {{#each model as |post|}}
	    <div class="public-post">
	      {{post.title}}
	    </div>
	  {{else}}
	    No Public Posts Found!
	  {{/each}}
    </div>
    <div class="col-sm-6">
      {{private-posts}}
    </div>
  </div>
</div>
```

##### Additional References

https://auth0.com/blog/2015/08/11/create-your-first-ember-2-dot-0-app-from-authentication-to-calling-an-api/
