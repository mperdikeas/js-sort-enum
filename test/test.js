import 'babel-polyfill';
import {Sort, SortHub} from '../lib/app.js';
const assert     = require('assert');

describe('Sort', function () {
    it('should correctly report next values'
       , function () {
           assert.equal(Sort.NONE.next(), Sort.ASC);
           assert.equal(Sort.ASC.next() , Sort.DESC);
           assert.equal(Sort.DESC.next(), Sort.NONE);
       });
});


describe('Documentation', function() {
    it('should not break',
       function() {
           let a = Sort.NONE;
           a = a.next(); // a is now Sort.ASC
           a = a.next(); // a is now Sort.DESC
           a = a.next(); // a is now Sort.NONE

           let b = new SortHub();
       });
});

describe('SortHub', function () {
    const a = {v: Sort.NONE};
    function getter() {return a.v;}
    function setter(v) {a.v = v;}

    it('should not break for trivial scenario'
       , function () {
           const hub = new SortHub();
           const notify = hub.add( getter, setter );
           assert.equal(typeof notify, 'function');
           notify();
           hub.lock();
       });

    it('should not allow more than one non-NONE'
       , function () {
           a.v = Sort.ASC;
           const hub = new SortHub();
           const notify = hub.add( getter, setter );
           assert.throws( ()=>{hub.add( getter, setter );} );
       });

    it('should not allow sorters to be added after lock'
       , function () {
           a.v = Sort.NONE;
           const hub = new SortHub();
           const notify = hub.add( getter, setter );
           hub.add( getter, setter );
           hub.add( getter, setter );
           hub.lock();
           assert.throws( ()=>{hub.add( getter, setter );} );
       });

    it('should correctly change other values when a sorter changes (i)'
       , function() {
           const sorterA = {v: Sort.NONE};
           const sorterAGet = function() {return sorterA.v;};
           const sorterASet = function(v) {sorterA.v = v;};

           const sorterB = {v: Sort.ASC};
           const sorterBGet = function() {return sorterB.v;};
           const sorterBSet = function(v) {sorterB.v = v;};

           const sorterC = {v: Sort.NONE};
           const sorterCGet = function() {return sorterC.v;};
           const sorterCSet = function(v) {sorterC.v = v;};
           
           const hub = new SortHub();
           const notifierA = hub.add(sorterAGet, sorterASet);
           const notifierB = hub.add(sorterBGet, sorterBSet);
           const notifierC = hub.add(sorterCGet, sorterCSet);
           hub.lock();
           sorterA.v = sorterA.v.next();
           notifierA();
           assert.equal(sorterA.v, Sort.ASC);
           assert.equal(sorterB.v, Sort.NONE);
           assert.equal(sorterC.v, Sort.NONE);           
       });
    it('should correctly change other values when a sorter changes (ii)'
       , function() {
           const sorterA = {v: Sort.NONE};
           const sorterAGet = function() {return sorterA.v;};
           const sorterASet = function(v) {sorterA.v = v;};

           const sorterB = {v: Sort.DESC};
           const sorterBGet = function() {return sorterB.v;};
           const sorterBSet = function(v) {sorterB.v = v;};

           const sorterC = {v: Sort.NONE};
           const sorterCGet = function() {return sorterC.v;};
           const sorterCSet = function(v) {sorterC.v = v;};
           
           const hub = new SortHub();
           const notifierA = hub.add(sorterAGet, sorterASet);
           const notifierB = hub.add(sorterBGet, sorterBSet);
           const notifierC = hub.add(sorterCGet, sorterCSet);
           hub.lock();
           notifierA();
           assert.equal(sorterA.v, Sort.NONE);
           assert.equal(sorterB.v, Sort.DESC);
           assert.equal(sorterC.v, Sort.NONE);

           sorterB.v = sorterB.v.next();
           notifierB();
           assert.equal(sorterA.v, Sort.NONE);
           assert.equal(sorterB.v, Sort.NONE);
           assert.equal(sorterC.v, Sort.NONE);

           sorterC.v = sorterC.v.next();
           notifierC();           
           assert.equal(sorterA.v, Sort.NONE);
           assert.equal(sorterB.v, Sort.NONE);
           assert.equal(sorterC.v, Sort.ASC);

           sorterC.v = sorterC.v.next();
           notifierC();
           assert.equal(sorterA.v, Sort.NONE);
           assert.equal(sorterB.v, Sort.NONE);
           assert.equal(sorterC.v, Sort.DESC);

           sorterB.v = sorterB.v.next();
           notifierB();
           assert.equal(sorterA.v, Sort.NONE);
           assert.equal(sorterB.v, Sort.ASC);
           assert.equal(sorterC.v, Sort.NONE);

       });    
    
});

