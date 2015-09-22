---
title: "Sophisticating Your CSS"
collection: "posts"
peak: CSS is our way to style the web CSS is easy to write, but hard to write well…
date: "2014-11-16"
link: sophisticating-your-css
---

*   CSS is our way to style the web
*   CSS is easy to write, but hard to write well
*   What can we do to sophisticate our CSS?

I love quick iterations, new projects, and changing directions, but every time I switch to an old project to make changes I: a) refactor my css to keep everything from breaking or b) pump out a really hackey hotfix.

I researched other people’s CSS ideas, processes and workflows. My focus was figuring out the keys to maintainable, adaptable, and portable stylesheets. These were the biggest takeaways:

1.  Write Consistent CSS
2.  Preprocess and Build Your CSS
3.  Strategically Name and Use Classes
4.  CSS Hat Tricks

## Write Consistent CSS

### Formatting

Adopting a common css formatting style increases the readability of your stylesheets. This ultimately saves time working with the code, making it easier to hunt bugs and author predictably.

As long as you and your team agrees and enforces a style, it really dosn’t matter what it is, as long as it’s consistent.

Some examplezz:
```
    /**
     * - Consistent Whitespace & Formatting
     * - Organization inside declaration blocks
     * ---- Extends & Includes
     * ---- Positioning
     * ---- Display & Box Model
     * ---- Text & Styles
     * ---- Animations, Transforms, Transitions, Other
     * - So much more...
    */
    .component1,
    .component2,
    .component3 {
        /* Extends & Includes */
        @extend .component;
        @include clearfix();

        /* Positioning */
        position: relative;

        /* Display & Box Model */
        padding: 1em 2em;
        border: 1px solid #333333;

        /* Text & Styles */
        font-famliy: "Lucida Grande", sans-serif;

        /* Animations, Transforms, Transitions, Other */
        transition: opacity 0.1s ease-in;
    }
  ```

The important thing is finding a style that works for you and your team, **and enforcing it ruthlessly**. Here are some great resources:

*   [Idiomatic CSS](https://github.com/necolas/idiomatic-css)
*   [CSSguidelin.es](http://cssguidelin.es/)
*   [timhartmann/Scss-Styleguide](https://github.com/timhartmann/Scss-Styleguide)
*   [https://github.com/styleguide/css](https://github.com/styleguide/css)

### Organizing

Organizing on a file system level is critical.

This makes every section of CSS self-evident and minimizes CSS bloat.

Again, there are a lot of potential answers here. **Right** answers involve consistency and simplicity. That means using the same structure on every project and breaking things into an unambiguous taxonomy.

Here’s what I do:

    application.scss
    config/
      - ./_reset.scss
      - ./_base.scss
      - ./_variables.scss
      - ./_utilities/*.scss
      - ./_grid.scss
    elements/_element_name.scss
    blocks/_black_name.scss
    _grid.scss
    _vendor.scss

### application.scss

This file is for weaving all the other files together in order.

    /* application.scss */
    @import "_config/_variables";
    @import "_config/_reset";
    @import "_config/_utilities/_utilityname";
    /* list additional utilities */

    @import "_elements/_elementname/_elementname";
    /* List additional elements */

    @import "_blocks/_blockname/_blockname";
    /* List additional blocks */

    @import "_vendor";

### config

#### base

Style the base elements, default link styles, etc.

    /* _base.scss
    body { /* styles */}
    h1, h2, h3, h4 { /*styles */ }

#### reset

This is usually either a full reset, like [Eric Meyer Reset](http://meyerweb.com/eric/tools/css/reset/) or something based on [normalize.css](http://necolas.github.io/normalize.css/).

#### variables

This is where I keep all the global variables. Colors, Font names, etc…

#### utilities

Utility classes like [clearfix](http://nicolasgallagher.com/micro-clearfix-hack/), [universal box sizing](http://nicolasgallagher.com/micro-clearfix-hack/), and [the ultimate px/rem mixin](http://hugogiraudel.com/2013/03/18/ultimate-rem-mixin/).

#### grid

Grid lives here. I’ve used [flexible.gs](http://flexible.gs/), [Flexbox Grid](http://flexboxgrid.com/), the [bootstrap grid](http://getbootstrap.com/css/#grid), and so many more.

### elements/_element_name

Fundamental site elements go here. Things like buttons, form element, title, images, tables, etc.

### blocks/_black_name.scss

This is there components (as in, groups of elements) like. Things like: navbar, article, sidebar, etc.

**!important** I’d make sure to turn on [source maps](http://thesassway.com/intermediate/using-source-maps-with-sass) to make debugging quicker

## Preprocessor and Task Runner

Historically I’ve used a `main.css` to avoid the initial headache of setting up a task runner. I inevitably regret this, which means a lengthy refactor or just hacking around not having the right setup.

Instead, use a task runner from the beginning. That way you can use a preprocessor (SASS/SCSS/LESS/Stlus/Whatever-floats-your-boat) and automate repetitive, useful css tasks.

### Using SASS/SCSS/LESS/Stylus/Whatever

Using a preprocessor offers some real advantages. Mainly:

*   Variables
*   Color functions
*   Arithmetic
*   Breakpoints
*   Imports

### Word of Caution

Thankfully, most people now use preprocessors. This has actually turned the tide to a completely different problem.

If you abuse your preprocessor, it can spit out really really terrible CSS. Avoid going crazy.

*   Keep nesting 2 or 3 levels MAX.
*   Avoid Libraries (to keep code portable)
*   Avoid terse and fancy techniques that could lead to random code.

### Using a Task Runner

This is a massive topic unto itself. Instead of walking through too many specifics, I’ll just mention some CSS specifics worth looking into for your Grunt/Gulp/Broccli workflow:

*   [CSS Lint](https://github.com/CSSLint/csslint)
*   [CSS Comb](http://csscomb.com/)
*   Autoprefix [(tutorial)](http://cognition.happycog.com/article/auto-prefix-all-the-things)
*   LiveReload
*   Minify

## Strategically Name and Use Classes

Though sprints, having a plan for naming classes and uses classes in CSS is a cornerstone for producing maintainable stylesheets

My opinion is to use a BEM based naming convention and [OOCSS](http://www.smashingmagazine.com/2011/12/12/an-introduction-to-object-oriented-css-oocss/) as a guide for how to use classes.

### OOCSS

OOCSS is all about:

#### Separate structure from skin

The padding, position, and spacing of an element should be independent of the presentational style.

#### Separate container from content

Elements shouldn’t care about their containers. Breaking these dependencies allow code to be more modular and portable.

    /* No OOCSS */
    #sidebar {
        .btn {
            padding: 0.2em;
            background: #cccccc;
            color: #333;
        }
    }

    /* OOCSS */

    /* pull box out of it's dependency on #sidebar */
    .btn {}

    /* separate out presentational styles */
    .btn-default {
        background: #cccccc;
        color: #333;
    }

    .btn-error {
        background: #da2b1e;
        color: #ffffff;
    }

    /* separate out structural styles */
    .btn-padded {
        padding: 1em;
    }

    .btn-padded-narrow {
        padding: 0.2em;
    }

Why does all this matter?

Let’s say you have a page with some buttons in the sidebar.

    <!-- Pre OOCSS -->
    <div id="sidebar">
        <a href="/" class="btn">
            Home
        </a>
    </div>
    <div id="main">
        <p>
            Lorem...
        </p>
    </div>

And now it turns out you need some larger error buttons in the `#main` section of your site. Before this would mean duplicating code. But with an OOCSS approach you can add some simple classes and reuse your base button styles.

    <!-- Pre OOCSS -->
    <div id="sidebar">
        <a href="/" class="btn btn-default btn-narrow">
            Home
        </a>
        ...
    </div>
    <div id="main">
        <p>
            Lorem...
            <a href="/" class="btn btn-error btn-padded">
                Learn more
            </a>
        </p>
    </div>

Critics will say that this will lead to non-semantic weird HTML, which is kind of true. But the trade-off is scalable and modular CSS

### BEM

BEM is a way of crafting your CSS class names to make their function instantly evident.

The syntax can look bizarre at first, but the gained self-evidence is worth it.

To directly reference [@csswizardry’s MindBEMding – getting your head ’round BEM syntax](http://csswizardry.com/2013/01/mindbemding-getting-your-head-round-bem-syntax/)

    /* .block represents the higher level of an abstraction or component. */
    .block {}

    /* .block__element represents a descendent of .block that helps form .block as a whole. */
    .block__element {}

    /* .block--modifier represents a different state or version of .block.*/
    .block--modifier {}

Here’s an Oklahoma example:

    /* [block - truck][element - dodge][modifier - engine] */
    .truck {}
    .truck__engine {}
    .truck--dodge {}
    .truck--dodge__engine {}

Or an actual example:

    /* [block - button][element - danger][modifier - disabled] */
    .button {}
    .button__disabled {}
    .button--danger {}
    .button--danger__disabled {}

Use SASS and make it a little easier to write this syntax: [Support for BEM modules SASS](http://mikefowler.me/2013/10/17/support-for-bem-modules-sass-3.3/)

Or use the [Yandex BEM/OOCSS Emmet filter](http://docs.emmet.io/filters/bem/).

**!important** Even if you don’t use BEM, just find a naming convention that works for you. The most important thing is that it’s consistent and a classes function is self-evident by the name.

## CSS Hat Tricks

And here’s the hard part. Being good at CSS honestly involves having a lot of tricks up your sleeves.

Here an opinionated list of the most useful tricks:

*   Don’t get fancy with you selectors. `.widget-title` is better than `#main header > h1`

*   Apply some classic programming principles to make your css [SOLID](http://blog.millermedeiros.com/solid-css/)
    *   Single Responsibility Principle — Each class should only have one responsibility
    *   Open/Closed Principle — Make extending base things easy, but hard to modify.
    *   Liskov Substitution Principle — If you have `.button`, `.button-danger`, and `.button-success`, they should all be interchangeable in your HTML without breaking your UI.
    *   Interface Segregation Principle — “many client specific interfaces are better than one general purpose interface.”
    *   Dependency Inversion Principle — Container (like `.container` elements shouldn’t depend on their children (like `.btn` or `.headline`, and child elements shouldn’t depent on their containers).
*   Consider [Opt-in Typography](http://css-tricks.com/opt-in-typography/) so you don’t have to over-write a lot of article typography to style your UI components (like a navbar)

*   “Components should be standalone, reusable, and have no knowledge of their parent container” [source](http://www.phase2technology.com/blog/used-and-abused-css-inheritance-and-our-misuse-of-the-cascade)

*   Keep SASS simple. No over-nesting, clever terse tricks, or insane programatic class generation.

*   Don’t forget to actually look at the generated CSS file

*   `.class-names` are more powerful and flexible than `#id`’s and basic elements (like `a`, `p`, `h1`, etc)

*   Sniper targeting things

        /* Grenade */
        main-nav ul li ul {}

        /* Sniper Rifle */
        .subnav {}

        /* Source: http://philipwalton.com/articles/css-architecture/ */

*   Maintainable > DRY

*   Maintainable > Semantic

## Additional Links

### Tools

[CSS Dig](http://atomeye.com/css-dig.html)  
[CSS Comb](http://csscomb.com/)  
[CSS Lint](http://csslint.net/)

### How Other People Do It

[CSS-Tricks: Sass Style Guide](http://css-tricks.com/sass-style-guide/)  
[Github CSS Style Guide](https://github.com/styleguide/css)  
[@mdo on Github’s CSS](http://markdotto.com/2014/07/23/githubs-css/)  
[CSS at Lonely Planet](http://ianfeather.co.uk/css-at-lonely-planet/)  
[How we do CSS at Ghost](http://dev.ghost.org/css-at-ghost/)  
[Medium’s CSS is Actually pretty ****ing good.](https://medium.com/@fat/mediums-css-is-actually-pretty-fucking-good-b8e2a6c78b06)  
[Codepen’s CSS](http://codepen.io/chriscoyier/blog/codepens-css)

### Other Links

[Scalable CSS Reading List by David Clark](https://github.com/davidtheclark/scalable-css-reading-list)  
[Ben Frain: Enduring CSS](http://benfrain.com/enduring-css-writing-style-sheets-rapidly-changing-long-lived-projects)  
[Andy Hume: CSS for Grownups](https://www.youtube.com/watch?v=ZpFdyfs03Ug)
