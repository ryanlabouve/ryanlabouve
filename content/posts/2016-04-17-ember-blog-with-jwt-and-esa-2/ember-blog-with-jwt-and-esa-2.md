---
title: "Ember Blog with JWT and Ember Simple Auth, Part 2"
collection: "posts"
date: "2016-04-18"
link: ember-blog-with-jwt-and-esa-2
peak: "Setup Ember Simple Auth and connect to Rails API for our toy blog"
---

{% raw %}

Goal:

> Serve an API backed blog with Public (available to everyone) and Private posts (have to log in to see).

![Final Product](../posts/2016-04-17-ember-blog-with-jwt-and-esa-2/final-product-anno.jpg)

Welcome to part 2. Haven't done part 1 yet? Catch up [here](http://ryanlabouve.com/ember-blog-with-jwt-and-esa/).

Today we are going to focus on installing and customizing Ember Simple Auth, TDD'ing and building features along the way.

Here's the Specific Agenda:

1. Install addon
2. Extend mirage to mock our API's authentication/authorization
3. Implement login form and Custom Authenticator (ESA)
4. Implement private-posts and an Custom Authorizer (ESA)
5. Use bootstrap to style things up a bit

Let's get started

```
ember install ember-simple-auth
```

## Extending Mirage to Test Auth

We'll need to customize ESA to how our API handles authentication. To guide our customization, we are going to make mirage act like our server does currently

Good testing here gives us the benefit of a tight feedback loop, even when things get particularly tricky (as they do with installing anything auth related).

### Using Authenticators to Request our Token

In vanilla CURL language, to request a token we need to `POST` to a specified endpoint, with our username and password in a specified format.

In our case, that means:

```
POST http://localhost:3000/knock/auth_token
{ "auth" : { "email": "lester@tester.com", "password" : "test1234" }}
```

If it's successful, we'll get back a `201 Created` along with the token associated to our user.

```
201 Created
{ "jwt" : "token123456789" }
```

If the username and password are incorrect we'll get a `404`.

Let's start by simulating this in mirage:

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

> `hotdog` will be the token we use for testing... because I was hungry when I wrote this.

### Making Authorized Requests with `hotdog`

And when we make requests, we pass the token

```
Authorization: Bearer hotdog
GET /private-posts
```

Assuming our token is correct, the request will process normally. If the token is invalid, then we'll get a `401 Unauthorized`.

To simulate this in mirage, we'll do

```
  // mirage/config.js
  ...
  
  this.get('/private-posts', ({ privatePost }, request) => {
    const token = Ember.get(request, 'requestHeaders.Authorization');
    if (token === 'Bearer hotdog') {
      return privatePost.all();
    } else {
      return new Mirage.Response(401, {}, {});
    }
  });
  ...
```

### Mirage for our PriavtePosts

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

([checkpoint](https://github.com/ryanlabouve/ember-jwt-esa-blog/commit/ffdd071f87a16dd6f5b64313016d1661b80bfa2f))

So far, we've just been doing enough setup to mock how our server currently works. Let's dive into implementing some stuff now.

## Implement login form and Custom Authenticator (ESA)

To create our tight feedback loop, we'll go ahead and work on `{{login-form}}`, since this will be able to quickly hit logging in and out.

Here are the main cases we want to handle:

* If a user is not logged in, they see a login form
* If a user is logged in, they see a logout button
* A user can logout
* A user can login
* If a user puts in the wrong login credentials, they see a login error

> This process seems tedious, but focusing on TDD our way through helps us keep focus and make consistent progress on a good path.

Generate the Test:

```
ember g acceptance-test login-form
```

I am going to make a fairly presumptuous first pass at this. In reality, you might bounce back and forth a lot more to expand this test over time.

```
// tests/acceptance/login-form-test.js

import { test } from 'qunit';
import moduleForAcceptance from 'ember-jwt-esa-blog/tests/helpers/module-for-acceptance';
import Ember from 'ember';

// These test helps are included with ESA, and
// are absolutely critical for sane testing.
import {
  currentSession,
  invalidateSession ,
  authenticateSession
} from 'ember-jwt-esa-blog/tests/helpers/ember-simple-auth';

moduleForAcceptance('Acceptance | login form');


test('If a user is not logged in, they see a login form', function(assert) {
  invalidateSession(this.application);
  visit('/');

  andThen(function() {
    const loginFormPresent = find('#loginForm').length > 0 ? true : false;
    assert.equal(loginFormPresent, true);
  });
});

test('if a user is logged in, they see a logout form', function(assert) {
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

    const loginFormPresent = find('#loginForm').length > 0 ? true : false;
    assert.equal(
      loginFormPresent,
      false,
      'after we login, the login form disappears'
    )
  });
});

test('If a user puts in the wrong login credentials, they see a login error', function(assert) {
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

    const isShowingLoginFails = find('.login-err').length > 0 ? true : false;
    assert.equal(
      isShowingLoginFails,
      true,
      'Shows user an error when they put in bad deets'
    );

    const loginFormPresent = find('#loginForm').length > 0 ? true : false;
    assert.equal(
      loginFormPresent,
      true,
      'and we can still see the login form'
    )
  });
});
```

Right now our tests make a giant wall of "better luck next time". Let's just start picking from the top.

![fu tests](../posts/2016-04-17-ember-blog-with-jwt-and-esa-2/part2-fu-tests.jpg)

#### Login Form

Generate login form component:

```
ember g component login-form --pod
```

And a first pass at a very basic login form with fields that match what we already wrote in our test:

```
// app/components/login-form/template.hbs
<div id="loginForm">
  {{#if loginError}}
    <div class="login-err alert alert-error">Bad deets dude.</div>
  {{/if}}

  {{input
    value=identification
    placeholder="identification"
    class="username-field"}}
  {{input
    type="password"
    placeholder="password"
    value=password
    class="password-field"}}
  <a href="/login"
     class="login-btn btn btn-primary"
     {{action "login"}}>
    Login
  </a>
</div>
```

Cool. More red. Not a ton-o-info from the actual tests, so let's check out our console. `.logoutBtn` not found.

![fu tests 2](../posts/2016-04-17-ember-blog-with-jwt-and-esa-2/part2-2-fu-tests.jpg)

#### Logout Form

The strategy here is to use the `session` from ESA to show a login form, unless we are `session.isAuthenticated`, where we'll show a logout form.

First, let's get the session in our component

```
// app/components/login-form/component.js
import Ember from 'ember';

export default Ember.Component.extend({
  session: Ember.inject.service()
});

```

And next, we'll add the branch logic.

```
{{#unless session.isAuthenticated}}
	... login form from earlier
{{else}}
  <a href="/logout"
     class="logoutBtn"
     {{action "signout"}}>
    logout
  </a>
{{/unless}}
```

([checkpoint](https://github.com/ryanlabouve/ember-jwt-esa-blog/commit/192cf82d074f35a1b363133f78ac520860c63464))

New batch of errors! Let's go ahead and add the `login` and `signout` actions it's complaining about.

```
import Ember from 'ember';

export default Ember.Component.extend({
  session: Ember.inject.service(),
  actions: {
    login() {
      return true;
    },
    signout() {
      return true;
    }
  }
});
```

### Ember Simple Auth: The Tricky Parts

This part is tricky. Auth is a hard problem to solve, so any library that does it well will involve a bit of config.

#### Kickoff & Configure

Let's generate our custom authenticator and authorizer, which will generated stubbed out versions of the files. 

```
ember g authenticator knockjwt
// => create app/authenticators/knockjwt.js

ember g authorizer knockjwt
// => create app/authorizer/knockjwt.js
```

SO we can see what's going on, I suggest dropping debuggers in the critical parts of what was generated so we can see what's calling what.

Authorizer:
```
// app/authorizer/knockjwt.js
import Base from 'ember-simple-auth/authorizers/base';

export default Base.extend({
  authorize(/*data, block*/) {
    debugger;
  }
});
```

Authenticator:

```
import Ember from 'ember';
import Base from 'ember-simple-auth/authenticators/base';

export default Base.extend({
  restore(data) {
    debugger;
  },

  // This method will make the call to our auth server
  authenticate(/*args*/) {
    debugger;
  },

  invalidate(data) {
    debugger;
  }
});
```

And a little configure for ESA to recognize our custom auth and API situation:

```
// config/environment.js

  ENV['simple-auth'] = {
    store: 'simple-auth-session-store:local-storage',
    authorizer: 'authorizer:knockjwt',
    crossOriginWhiteList: ['http://localhost:3000'],
    routeAfterAuthentication: '/'
  }
```

Let's also use the [ApplicationRouteMixin](http://ember-simple-auth.com/api/classes/ApplicationRouteMixin.html) for the application route.

```
// app/routes/application.js
import Ember from 'ember';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

export default Ember.Route.extend(ApplicationRouteMixin, {
  model() {
    return this.store.findAll('publicPost');
  }
});
```

This will also mean you need to `needs: ['service:session']` to make the [application unit test pass](https://github.com/ryanlabouve/ember-jwt-esa-blog/commit/76b111ceb19ebc5c130f1d3b0d4a34d4fd120270) for the route unit test.

#### Customize the Authenticator

Ok. Now let's make the authentication call using our custom `application:knockjwt`. This should hit the debugger and we can step through what's happening.

```
// app/components/login-form/component.js
login() {
	// reset login error on each attempt
	this.set('loginError', false);
	
	const { identification, password } = this.getProperties( 'identification', 'password');
	const s = this.get('session');
	
	s.authenticate('authenticator:knockjwt', { identification, password }).catch(() => {
		// If login fails, just set an error
		// so the error UI shows up
		this.set('loginError', true);
	});
}
```

Cool. Run `http://localhost:4200/tests` again. We get to the authenticator's authenticate method!

And we know, in order to get token, we'll need to `POST /knock_auth` with the credentials. So let's go ahead and do that:

```
import Ember from 'ember';
import Base from 'ember-simple-auth/authenticators/base';
// import host from our environment
import config from '../config/environment';

const { RSVP: { Promise }, $: { ajax }, run } = Ember;

export default Base.extend({
  tokenEndpoint: `${config.host}/knock/auth_token`,

  restore(data) {
    debugger;
  },

  authenticate(creds) {
    const { identification, password } = creds;

    const data = JSON.stringify({
      auth: {
        email: identification,
        password
      }
    });

    const requestOptions = {
      url: this.tokenEndpoint,
      type: 'POST',
      data,
      contentType: 'application/json',
      dataType: 'json'
    };

    return new Promise((resolve, reject) => {
      ajax(requestOptions).then((response) => {
        const { jwt } = response;
        run((response) => {
          resolve({
            token: jwt
          });
        });
      }, (error) => {
        run(() => {
          reject(error);
        });
      });
    });
  },

  invalidate(data) {
    // debugger;
    return Promise.resolve(data);
  }

  }
});
```

![user can login](../posts/2016-04-17-ember-blog-with-jwt-and-esa-2/part2-3-fu-tests.jpg)

#### Logging User Out

This is quite a bit easier than the login portion:

```
// app/components/login-form/component.js
...
signout() {
  this.get('session').invalidate();
}
```

(Please see [this change](https://github.com/ryanlabouve/ember-jwt-esa-blog/commit/2e96f83c710f9134ed7acabcf6fb5279ee536838) I made for the login-form integration test to pass.)

> Danger! Our tests are green right now, but we know we haven't implemented Authorizer's `restore`. I'd honestly want to dive into some unit tests at this point, but I think I'll save that for a future post. Check out the ones that simple auth des for the [devise authenticator](https://github.com/simplabs/ember-simple-auth/blob/master/tests/unit/authenticators/devise-test.js) in the meantime for a good example.

```
  // When page refreshes, we have the ability
  // to inspect ESA data and see if we can restore
  restore(data) {
    return new Promise((resolve, reject) => {
      if (!Ember.isEmpty(data.token)) {
        resolve(data);
      } else {
        reject();
      }
    });
  }
```

([checkpoint](https://github.com/ryanlabouve/ember-jwt-esa-blog/commit/680376e2fced0ed0fc294aac2881c7d4e7f4620c))

### Implement PrivatePosts and Custom Authorizer

After we have successfully logged in, the authorizer is what allows us to take the login token and pass it with our request to the server.

The best way to get this working is TDD private-posts.

```
ember g acceptance-test private-post
```

```
import { test } from 'qunit';
import moduleForAcceptance from 'ember-jwt-esa-blog/tests/helpers/module-for-acceptance';

import {
  invalidateSession ,
  authenticateSession
} from 'ember-jwt-esa-blog/tests/helpers/ember-simple-auth';

moduleForAcceptance('Acceptance | private post');

test('see private posts when authed', function(assert) {
  authenticateSession(this.application);
  server.createList('private-post', 5);
  visit('/');
  andThen(() => {
    assert.equal(
      find('.private-post').length,
      5,
      'we can see the right number of private posts when we are logged in'
    );
  });
});

test('see no private posts not authed', function(assert) {
  server.createList('private-post', 5);
  invalidateSession(this.application);
  visit('/');
  andThen(() => {
    assert.equal(
      find('.private-post').length,
      0,
      'we can\'t see any private posts when we are not logged in'
    );
  });
});
```

Generate our `{{private-posts}}` component.

```
ember g component private-posts --pod
```

Add component to application template

```
// app/templates/application.hbs
{{login-form}}
<br />
{{public-posts posts=model}}
{{private-posts}}
```

There are a couple different ways to handle loading in the `PrivatePosts`, but I'm going to opt to handle all of that from the {{private-posts}} component. So you'll notice we are going to inject the store and the session, and then load them only if we are authenticated and conditionally when our authentication status changes.

```
// app/components/private-posts/component.js
import Ember from 'ember';

const { computed, get } = Ember;

export default Ember.Component.extend({
  session: Ember.inject.service(),
  store: Ember.inject.service(),

  posts: computed('session.isAuthenticated', function() {
    const authed = get(this, 'session.isAuthenticated');
    const store = get(this, 'store');
    if ( authed ) {
      return store.findAll('privatePost');
    } else {
      return undefined;
    }
  })
});
```

Put out posts in template

```
{{#each posts as |post|}}
  <div class="private-post">
    {{blog-post title=post.title body=post.body}}
  </div>
{{/each}}

```

No model found, so let's get on that!

```
ember g model private-post
```

I'd suggest doing the same type of model tests from earlier on the PrivatePost model, but for brevity we'll omit them here.

```
import Model from 'ember-data/model';
import attr from 'ember-data/attr';

export default Model.extend({
  title: attr('string'),
  body: attr('string'),
  createdAt: attr('date')
});
```

And now we are getting 401's even when authed. This sounds like it's time to work on our authorizer. We know we are not even hitting it currently, thanks to the debugger we dropped earlier.

Let's make our way to the debugger that's currently sitting there.

We'll do that by generating an adapter for `privatePost`, where we'll inform it to use the `knockjwt` authorizer we made via the [DataAdapterMixin](http://ember-simple-auth.com/api/classes/DataAdapterMixin.html), which is a nice bridge to inform Ember Data of our auth situation.

```
// remember, adapters describe how ED should request a given resource
ember g adapter privatePost
```

And then our adapter:

```
import ApplicationAdapter from './application';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';

export default ApplicationAdapter.extend(DataAdapterMixin, {
  authorizer: 'authorizer:knockjwt',
});
```

:boom: we are now seeing the debugger!!

To implement the authorizer, we need to focus on passing the relevant token along with the request, then it should work.

```
import Base from 'ember-simple-auth/authorizers/base';
import Ember from 'ember';

export default Base.extend({
  session: Ember.inject.service(),
  authorize(data, block) {
  	// If we are testing, just going to hardcode the token
    if (Ember.testing) {
      block('Authorization', 'Bearer hotdog');
    }
    const { token } = data;
    if (this.get('session.isAuthenticated') && token) {
    	// The way this works is that we are just using
    	// xhr.setRequestHeader on the other side of this call
    	// here: https://github.com/simplabs/ember-simple-auth/blob/a8723a0d4e8eb256f5a9527de0d8a04aeff94846/addon/mixins/data-adapter-mixin.js#L77
    	
      block('Authorization', `Bearer ${token}`);
    }
  }
});
```

([checkpoint](https://github.com/ryanlabouve/ember-jwt-esa-blog/tree/2e96f83c710f9134ed7acabcf6fb5279ee536838))

## Bootstrap & Pushing Pixels

Now that our app works, everything else we do is bonus!

### BootStrap

Add bootstrap (quick and dirty method):
```
<link rel="stylesheet" href="https://cdn.rawgit.com/twbs/bootstrap/v4-dev/dist/css/bootstrap.css" >
```

### Adjust Layout

Divs divs divs for days!

```
<div class="container m-y-3">
  <div class="row header">
    <div class="col-sm-6">
      <h1>blog</h1>
    </div>
    <div class="col-sm-6">
      {{login-form}}
    </div>
  </div>
</div>
<div class="container">
  <div class="row body">
    <div class="col-sm-6">
      {{public-posts posts=model}}
    </div>
    <div class="col-sm-6">
      {{private-posts}}
    </div>
  </div>
</div>
```

### Adjust Components

From here on out it's just a bunch of small adjustments all over the place. I'm just going to link to the commit and go over a few highlights:

![Final Product](../posts/2016-04-17-ember-blog-with-jwt-and-esa-2/final-product.jpg)

* Due to the HTML / CSS structure required for some bootstrap components, I had to put classesNames on the `component.js` in several cases.
* I changed the selectors being used in a few acceptance tests for similar reasons.

([CSS boss battle commit](https://github.com/ryanlabouve/ember-jwt-esa-blog/commit/452b946163fe2f9cae7ec4e8a886bbe7d89194f1))

> If it would be useful for anyone for me to walk through this, please let me know on twitter ([@ryanlabouve](http://twitter.com/ryanlabouve)). I'd be happy to do this!

## Closing Thoughts

Authentication and Authorization is tricky. I'm hoping this resource will show a no-holds barred example of how to start implementing it on an actual projects using methods you'd be proud of.

Please let me know if you have any feedback! Positive or negative, I'd like for this to be as useful as possible so please read out to me on twitter [@ryanlabouve](http://twitter.com/ryanlabouve) or on github [github.com/ryanlabouve](https://github.com/ryanlabouve).

{% endraw %}
