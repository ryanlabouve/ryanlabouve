Let's set the stage.

You take over an existing Ember project. There is some testing, but it's not clear if it's adding any real value. 

Your project is in production, so it's not like you can just throw the lever and bring development to a grinding halt, but you are faced with needing to make some big underlying changes in the codebase (let's say moving from controllers all the time to components).

This is where a great test suite would come in handy, but it's not there. You need some way to offer some bare assurances that you are not blowing up the code every time you push to production.

Here's the no thrills guide to start testing.

1. CI and green tests for deploy
2. Automatic Bug Tracking and Regression Testing
3. Acceptance a few blessed paths
4. Test coverage, for what it's worth
5. Work towards a culture of testing



## CI and green tests for deploy
Skip all tests that are failing
Test for style

## Acceptance Tests for Blessed Paths

Our goals here are to:

* Click through the whole app

* Establish a good mocked backend for all future tests

This topic was in depth enough to cover in another post: [The First Test I Wite on an Untested Project](#)

## Test Coverage

* High test coverage is not a good goal. Well tested code with high test coverage is a good goal.



Testing for new features
Testing for regressions