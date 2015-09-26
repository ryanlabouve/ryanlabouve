---
title: "Our Release Cycle"
date: 2015-09-24
collection: posts
peak: todo
draft: true
---

https://spoken.co/

## Why care about release cycles?

Release cycles are necessary when projects depend on each other.

For single projects, it's easy to argue _process overkill_ (even though it's often not). For us, there are 3 ember apps, 1 ionic app, and 1 rails api and doing release cycles is a bacon saver.

Data flows (and changes) through each product. Small changes in any project can have an effect on the others. This _has_ lead to unintentional and undetected breaking changes across projects. Planned release cycles shield against this.


## Release Cycles: Some Practicals

* The Groundwork: Sprints, QA, and Release Schedules 
* Defining Releases: SemVer, Gitflow and More
* Release Cycles In action

### The Groundwork: Sprints, QA, and Release Schedules

Your underlying process is important for facilitating sane release cycles.

#### Sprints

You have to be moving at a predictable pace to have predictable releases. Ideally, the sprint length would be at least two weeks to allow for enough time for QA and Release Candidates.

#### Environments

I argue for 4 environments: Local Development, Development, Staging, and Production.

Local Development will sometimes require slight deviations from production environemtns. E.G. running locally on OSX/Windows instead of running on AWS.

However, Development, Staging, and Production should be _exactly the same_ in terms of setup and deploy. The big difference being:

* Local Development is pre-deploy work
* Development is highly volitle— changing continually
* Staging should host release candidates, and change once per sprint (barring any hotfixes)
* Production should only change once a sprint, having well tested and QA'd code... and it should be a sprint behind staging


### Defining Release Cycles

#### Versioning and Tagging

For release cycles to mean anything you must version and tag them. This was something I thought was rather mystical, but, quite simply this could mean:

```
git tag -a v1.0.0 -m 'Product Launch\!'
```

See more about [tagging in git](https://git-scm.com/book/en/v2/Git-Basics-Tagging).

It's important to define and follow a convention for your version naming. I like [SemVer](http://semver.org/), which is `MAJOR.MINOR.PATCH` format (read the site, worth it). Otherwise you'll see crap like `11.7xz™.888-final-v2` and release cycles become pointless.

_Lock-Step Versions_: If you are dealing with multiple apps, it's nice to sync MAJOR and MINOR versioning so if SHTF it's easy to rollback multiple apps without breaking the other ones.

#### Release Schedules

We have a 4-week production release cycle. (I'll explain it in words, but also attaching fancy diagram).

Throughout the sprint, we are developing locally. Once we fix an issue we make a Pull Request to `development`.

As issues are getting fixed and the sprint is closing out we typically troll up QA and try to prevent any regressions from going in to a release.

The sprint closes, all of the merged commits get turned into a release. If last week was `v3.12.8` then we would start to draft `v3.13.0-RC` and then push this to `staging`.

During the next sprint, QA is aggressively working over `staging`. This makes sense because staging is not really changing and this is the working snapshot of code we are wanting to make it on to production. Enevitablly there will be bugs. Ideally they will be minor.

If bugs are fixed, they are merged in as patches, i.e. `3.13.1-RC`, `3.13.2-RC`... and we'd go ahead a merge these back into `deveopment`.

At the end of the second sprint from when the original work began on what would become `3.13.x-RC`, we can now push to production with confidence. We'd go ahead and draft a full blown `3.13.0`.

And, _gasps_, if there were in fact bugs on production, we'd use the same patching model we did for the release candidate (i.e. fix a bug, `3.13.1`, merge back down through staging `3.13.3-RC` (note, just bumping the latest patch), and into development.

#### Release Draft & The Changelog

I would be 100% lying if I said I had this figured out on my own. This, I 100% ripped off from what I found on the Ember project (as well as many of my ideas on release cycles).

Here's my main tempalte:

```
Project v0.0.0[-''|RC]

A broad description of what was done or any big changes.

##### Release Draft

* #1  [LABEL] Issue Title
* #3  [LABEL] Issue Title 3

* #2  [LABEL2] Issue Title 2
* #4  [LABEL2] Issue Title 4

```

See [here](https://github.com/emberjs/ember.js/releases/tag/v2.1.0-beta.4) for inspiration.

##### Changelog

The changelog should be a living document that catalogues all of the `Changelog`s from release drafts.

See [here](https://github.com/emberjs/ember.js/blob/master/CHANGELOG.md) for inspiration
