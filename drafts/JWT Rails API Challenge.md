# JWT Rails API Challenge

Here's the goal:

	 Rails API that has secure (via JWT) and non-secure resources and is JSON API compliant.

Our scenario: We have a blog that has public posts, accessible by anyone, and private posts, only accessible to users who are logged in.

So we can focus on authentication Users and Posts will be generated.

Notes:

* Posts will be a base class for PrivatePosts and PublicPosts.
* JWT authentication will be implemented using [knock](https://github.com/nsarno/knock)
* JSON API compliance will be accomplished via [JSONAPI::Resources](https://github.com/cerebris/jsonapi-resources)
* I'll link out to relevant tests, with comments on what's being test, but try to keep the article terse.

Let's get started `rails-api new toy-blog-api-jwt`.

## The Models

For the schema, we want `Post(title:string, body:text, type:string` where type will for STI.

(For more on single-table inheritance, check out (this post)[http://blog.arkency.com/2013/07/sti/])

 
### Post Model

```
raills g model Post title:string body:text type:string
touch app/models/private_post.rb
touch app/models/public_post.rb
```

Then I went ahead and setup public post and private post as subclasses. This will come in handy later when we setup our resources.

```
# app/models/public_post.rb
class PublicPost < Post; end
```

and

```
# app/models/private_post.rb
class PrivatePost < Post; end
```

1. Setup fixture (sha1)
2. Unit test on `Post` model (sha1)
3. Implement Post Model

```
class Post < ActiveRecord::Base
  validates :body, presence: true
  validates :title, presence: true
  validates :type, presence: true

  POST_TYPES = %w(PublicPost PrivatePost)
  validates :type, :inclusion => { :in => POST_TYPES }
end
```

### User Resource

Here we want to setup a user that implements Rail's [`has_secure_password`](http://api.rubyonrails.org/classes/ActiveModel/SecurePassword/ClassMethods.html
). Most importantly what this gives us: when we create a `User`, we'll pass in a `password` and `password_confirmation` and rails will then encrypt and save as `password_digest`.

For the schema, we want `User(email:string, name:email, password_digest:string` where `password_digest` is for `has_secure_password`.

http://api.rubyonrails.org/classes/ActiveModel/SecurePassword/ClassMethods.html

```
rails g model user password_digest:string name:string email:string
```

1. Setup fixtures (sha1)
2. Setup unit test (sha1)
3. Implement `User` model

```
class User < ActiveRecord::Base
  has_secure_password
  
  validates :name, presence: true
  validates :email, presence: true
end
```
 
### Seeding Posts and Users

So now, to give us some posts and users to play with, we'll create some seeds.

Go ahead and add `gem 'faker'` to your Gemfile and `bundle install`.

```
# db/seeds.rb
Post.destroy_all
User.destroy_all

User.create!({
  name: 'Lester Tester',
  email: 'test@user.com',
  password: 'test1234',
  password_confirmation: 'test1234'
})

100.times do
  PublicPost.create!(
    title: Faker::Lorem.sentence,
    body: Faker::Lorem.paragraphs
  )

  PrivatePost.create!(
    title: Faker::Lorem.sentence,
    body: Faker::Lorem.paragraphs
  )
end
```

## Controllers and Resources and Routing Oh My!

Now's when we'll need to introduce [JSONAPI::Resources](https://github.com/cerebris/jsonapi-resources) by adding `gem 'jsonapi-resources'` to your gemfile.

### Public Posts

1. Generate your controller and write tests for `PublicPosts`

`rails g controller PublicPosts`.

And then set it up as a JSONAPI::Resources controller:

```
# app/controllers/public_posts_controller.rb
class PublicPostsController < ApplicationController
  include JSONAPI::ActsAsResourceController
end
```

Next, let's write the tests for the `PublicPosts`.

We want to `GET /public-posts` and get a list of the public posts, and `GET /public-posts/:id` to show a single post. Then, we should not be able to create, edit or delete. (Here are the tests: SHA1)

2. Generate `PublicPosts` resource and add to your routes.rb.

`rails generate jsonapi:resource public_posts`

```
class PublicPostResource < JSONAPI::Resource
  immutable
  attributes :title, :body
end
```

and then in routes

```
# config/routes.rb
jsonapi_resources :public_posts
```

### Private Posts

Setup knock.

run `rails generate knock:install`

Mount Knock engine in routes:
`include Knock::Authenticable`


