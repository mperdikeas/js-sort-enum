sort-enum
=========

Utility class for sort enumeration and miscellaneous
sorting-related semantics.

No actual sorting algorithms implemented.

## Installation

  npm install sort-enum --save

## Usage

````javascript
import {Sort, SortHub} from 'sort-enum';
let a = Sort.NONE;
a = a.next(); // a is now Sort.ASC
a = a.next(); // a is now Sort.DESC
a = a.next(); // a is now Sort.NONE

let b = new SortHub();
// SortHub basically caters to situations where, e.g. you have
// a table with sorted columns and you want when one column
// is sorted to automatically disable sorting on the others.
// It also allows you to ask the hub to return the 'column'
// that's currently enabled for sorting. 
// However, using the SortHub is a bit more involved and I
// don't have the time to document this now; have a look at the tests.


````

## Tests
  npm test

## Release History

* 0.1.0 Initial release
* 0.1.1 fixed typo in package.json
* 0.1.2 conditionally requiring the babel-polyfill
* 0.1.3 removed eval dependency
* 0.1.4 added returnSingleNonNoneRef on SortHub
* 0.1.5 added returnSingleNonNoneRef on SortHub
* 0.1.6 cosmetics in the README.md