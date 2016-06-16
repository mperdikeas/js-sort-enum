sort-enum
=========

Utility class for sort enumeration and miscellaneous
sorting-related semantics.

No actual sorting algorithms implemented.

# Installation

  npm install sort-enum --save

# Usage

````javascript
import {Sort, SortHolder, SortHub} from 'sort-enum';
````
## simple enum usage without hub
````javascript
let a = Sort.NONE;
a = a.next(); // a is now Sort.ASC
a = a.next(); // a is now Sort.DESC
a = a.next(); // a is now Sort.NONE
````
## simple holder usage without a hub
````javascript
const s1 = new SortHolder();
assert(s1.v===Sort.NONE);
s1.next();
assert(s1.v===Sort.ASC);
s1.next();
assert(s1.v===Sort.DESC);
````

## holder usage with a hub

`SortHub` basically caters to situations where, e.g. you have
a table with sorted columns and you want when one column
is sorted to automatically disable sorting on the others.
It also allows you to ask the hub to return the 'column'
that's currently enabled for sorting.

`SortHolder` is a utility class that under the hood uses
the more flexible `SortHub.add` method that accepts
simple getter and setter functions (see `test.js`
for examples of that).

````javascript
const hub = new SortHub();
const s1 = new SortHolder(hub, Sort.ASC);
const s2 = new SortHolder(hub);
hub.lock(); // create the hub with new SortHub(false) if you don't want to bother with locking
assert(s1===hub.returnSingleNonNoneRef());
s2.next();
assert.equal(s1.v, Sort.NONE);
assert.equal(s2.v, Sort.ASC);
assert(s2===hub.returnSingleNonNoneRef());
s2.next();
assert.equal(s1.v, Sort.NONE);
assert.equal(s2.v, Sort.DESC);
assert(s2===hub.returnSingleNonNoneRef());
s2.next();
assert.equal(s1.v, Sort.NONE);
assert.equal(s2.v, Sort.NONE);
assert(null===hub.returnSingleNonNoneRef());                   
````


# Tests
  npm test

# Release History

* 0.1.0 Initial release
* 0.1.1 fixed typo in package.json
* 0.1.2 conditionally requiring the babel-polyfill
* 0.1.3 removed eval dependency
* 0.1.4 added returnSingleNonNoneRef on SortHub
* 0.1.5 added returnSingleNonNoneRef on SortHub
* 0.1.6 cosmetics in README.md
* 0.1.7 SortHolder utility class added
* 0.1.8 support for optional locking
* 0.1.9 cosmetics in README.md