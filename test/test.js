'use strict';

(function() {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
})();


import 'babel-polyfill';
import {Sort, SortHub, SortHolder} from '../lib/app.js';
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
           hub.lock();
           notify();
       });

    it('should not allow more than one non-NONE'
       , function () {
           a.v = Sort.ASC;
           const hub = new SortHub();
           const notify = hub.add( getter, setter );
           hub.lock();
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
    describe('expected failures in strange and unnatural situations', function() {
        it('should baulk on empty lock'
       , function () {
           const hub = new SortHub();
           assert.throws( ()=>{hub.lock();});
           }
          );
        it('should check arguments of add (i)', function () {
            const hub = new SortHub();
            assert.throws ( ()=>{hub.add(1,()=>{}, {});});
        });
        it('should check arguments of add (ii)', function () {
            const hub = new SortHub();
            assert.throws( ()=>{hub.add(()=>{},2, {});});
        });
        it('should check arguments of add (iii)', function () {
            const hub = new SortHub();
            assert.throws( ()=>{hub.add(()=>{},()=>{}, ()=>{});});
        });
        it('should check arguments of add (iv)', function () {
            const hub = new SortHub();
            assert.throws( ()=>{hub.add(()=>{},()=>{}, 3);});
        });
        it('should allow a consistent ref usage pattern', function() {
            const hub = new SortHub();
            hub.add( ()=>Sort.NONE,()=>{}, {});
            hub.add( ()=>Sort.ASC,()=>{}, {});
            assert.throws( ()=> {hub.add( ()=>Sort.NONE,()=>{}); } );
        });
    });
    it('returnSingleNonNoneRef works'
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
           const notifierA = hub.add(sorterAGet, sorterASet, sorterA);
           const notifierB = hub.add(sorterBGet, sorterBSet, sorterB);
           const notifierC = hub.add(sorterCGet, sorterCSet, sorterC);
           hub.lock();
  
           assert(hub.returnSingleNonNoneRef()===sorterB);           

           notifierA();
           assert(hub.returnSingleNonNoneRef()===sorterB);
           assert.equal(sorterA.v, Sort.NONE);
           assert.equal(sorterB.v, Sort.DESC);
           assert.equal(sorterC.v, Sort.NONE);


           sorterB.v = sorterB.v.next();
           assert(hub.returnSingleNonNoneRef()===null);
           notifierB();
           assert(hub.returnSingleNonNoneRef()===null);
           assert.equal(sorterA.v, Sort.NONE);
           assert.equal(sorterB.v, Sort.NONE);
           assert.equal(sorterC.v, Sort.NONE);

           sorterC.v = sorterC.v.next();
           assert(hub.returnSingleNonNoneRef()===sorterC);
           notifierC();
           assert(hub.returnSingleNonNoneRef()===sorterC);           
           sorterB.v = sorterB.v.next();
           assert.throws( ()=>{hub.returnSingleNonNoneRef();} ); // notifier hasn't been called yet
           notifierB();
           assert(hub.returnSingleNonNoneRef()===sorterB);                      
           assert.equal(sorterA.v, Sort.NONE);
           assert.equal(sorterB.v, Sort.ASC);
           assert.equal(sorterC.v, Sort.NONE);
       });
    it('optional locking works', function() {
        const hub = new SortHub(false);
        const sh = new SortHolder(hub, Sort.ASC);
        assert(hub.returnSingleNonNoneRef()===sh);
        sh.next();
        assert(sh.v===Sort.DESC);
        sh.next();
        assert(sh.v===Sort.NONE);
        assert(hub.returnSingleNonNoneRef()===null);
        assert.throws(()=>{hub.lock();});
    });
});

describe('SortHolder', function() {
    it('should not break in trivial (no-hub) case'
       , function () {
           {
               const s1 = new SortHolder();
               assert(s1.v===Sort.NONE);
               s1.next();
               assert(s1.v===Sort.ASC);
               s1.next();
               assert(s1.v===Sort.DESC);
           }
           {
               const s2 = new SortHolder(null, Sort.ASC);
               assert(s2.v===Sort.ASC);
           }
       });
    it('should coordinate nicely with a hub'
       , function () {
           const hub = new SortHub();
           const s1 = new SortHolder(hub, Sort.ASC);
           const s2 = new SortHolder(hub);
           hub.lock();
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
       });
    it('should baulk when a new holder is added after the hub is locked'
       , function() {
           const hub = new SortHub();
           const s1 = new SortHolder(hub, Sort.ASC);
           const s2 = new SortHolder(hub);
           hub.lock();
           assert.throws( ()=>{new SortHolder(hub);});               
       });
    
});

