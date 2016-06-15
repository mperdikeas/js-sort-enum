sort-enum
=========

Utility class for sort enumeration and miscellaneous
sorting-related semantics.

## Installation

  npm install sort-enum --save

## Usage

````javascript
import {Sort, SortHub} from '../lib/app.js';
let a = Sort.NONE;
a = a.next(); // a is now Sort.ASC
a = a.next(); // a is now Sort.DESC
a = a.next(); // a is now Sort.NONE

let b = new SortHub();
// using the SortHub is more involved and don't have the
// time to document this now; have a look at the tests
````

## Tests
  npm test

## Release History

* 0.1.0 Initial release
* 0.1.1 fixed typo in package.json
* 0.1.2 conditionally requiring the babel-polyfill