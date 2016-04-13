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

## Mocking The Backend

```
ember install ember-cli-mirage@beta
```

Mirage models create _tables_ in Mirage's in memory database, while factories are the blueprints for what the data should look like in those tables.

We'll be creating factories and models `publicPosts`, `privatePosts`, and `users`.

`ember g mirage-model publicPost`
`ember g mirage-model privatePost`
`ember g mirage-model user`
`ember g mirage-factory publicPost`
`ember g mirage-factory privatePost`
`ember g mirage-model user`

And here are the factories for public and private post (they are the same for now). 

```
// mirage/factories/public-post.js
// mirage/factories/private-post.js
import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
  body: faker.lorem.words(),
  title: faker.lorem.paragraphs(),
  createdAt: faker.date.past()
});
```

And, the user factory.

```
// mirage/factories/user.js
import { Factory, faker } from 'ember-cli-mirage';

const fname = faker.name.firstName();
const lname = faker.name.lastName() ;
const name = `${fname} ${lname}`;
const email = `${name}@test.com`;

export default Factory.extend({
  name,
  email
});
```

Mirage is using [faker](https://github.com/FotoVerite/Faker.js), if you're curious where the faker methods came from. 

And now 

```
// mirage/config.js
export default function() {
  this.get('/public-posts');
  this.get('/private-posts');
  this.get('/users/:id');
}
```


```
ember g acceptance-test public-posts-test
```

```
import { test } from 'qunit';
import moduleForAcceptance from 'ember-jwt-toy-blog/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | public posts');

test('visited /', function(assert) {
  visit('/');
  server.createList('public-post', 5);

  andThen(function() {
    assert.equal(
      find('.public-post').length,
      5,
      'we can see all the public posts from /'
    );
  });
});
```

And now if we `ember serve` and visit `http://localhost:3000`, Yay! Failing test!

Now let's get'em green.

`ember g model publicPost`

```
import Model from 'ember-data/model';
import attr from 'ember-data/attr';

export default Model.extend({
  title: attr('string'),
  body: attr('string'),
  createdAt: attr('date')
});
```

`ember g route application`

```
// app/routes/application.js
import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    return this.store.findAll('publicPost');
  }
});
```

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

YAY! Green tests.


## The Prototype
### Qucik sketch of what we're making

### BootStrap

## Public Posts

Cut over to live API

## Signing in and out

## Private Posts

