---
title: "Ember Array Proxy: WTF Is This?"
date: 2015-09-24
collection: posts
peak: todo
draft: true
---

I have no idea what Array Proxy is. Let's find out.

Goals:

1. Definition
2. 3 Use Cases 

## What is Array Proxy

http://emberjs.com/api/classes/Ember.ArrayProxy.html

http://toranbillups.com/blog/archive/2015/04/23/hacking-array-proxy-to-observe-changes-on-nested-array/
http://spin.atomicobject.com/2015/04/01/ember-data-stability-arrayproxy/

http://stackoverflow.com/a/10570725/1181172
```
Note: As of this writing, ArrayController does not add any functionality to its superclass, ArrayProxy. The Ember team plans to add additional controller-specific functionality in the future, e.g. single or multiple selection support. If you are creating something that is conceptually a controller, use this class.
```

http://stackoverflow.com/questions/9071570/whats-the-purpose-of-arraycontroller-and-arrayproxy#comment11494051_9073128
```
Ember.ArrayController = Ember.ArrayProxy.extend();
```

http://www.domchristie.co.uk/posts/array-controllers-in-ember-js
```
An array controller is a wrapper for a collection of objects, and provides convenient methods for dealing with its contents.
```

## 3 Use Cases

### 1. 
???
http://stackoverflow.com/questions/10743271/ember-js-arrayproxy-array-of-models

??? Filtering
http://stackoverflow.com/questions/28021266/filtering-ember-arrayproxy

??? ObjectAtContent
http://emberjs.com/api/classes/Ember.ArrayProxy.html (control find it)

??? Mixin Remix
http://emberjs.com/api/classes/Ember.Enumerable.html
http://emberjs.com/api/classes/Ember.Evented.html

??? Using Other Lifecycle Hooks
http://emberjs.com/api/classes/Ember.ArrayProxy.html#method_arrayContentDidChange
http://emberjs.com/api/classes/Ember.ArrayProxy.html#method_arrayContentWillChange
http://www.tagwith.com/question_197718_best-practices-with-ember-arrayproxy

??? Could we paginate with ArrayProxy
http://resistor.io/blog/2013/10/01/simple-pagination-in-ember-arraycontrollers/


??? Could we COmputed Propery.[] something?
http://confreaks.tv/videos/emberconf2014-array-computed-properties

### 2. Sorting Array
http://blog.yanted.com/2015/03/17/ember-js-quick-tip-3-sorting-array-ember-way/
http://mattahorton.com/ember-array-sorting-without-arraycontroller/
http://stackoverflow.com/a/31614050/1181172

### 3. ember searchable array
https://www.npmjs.com/package/ember-searchable-array
