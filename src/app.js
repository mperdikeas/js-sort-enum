'use strict';


(function() {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
})();

import assert from 'assert';


class Sort {

    constructor(name, sign) {
        this.name = name;
        this.sign = sign;
    }

    toString() {
        return `Sort.${this.name}`;
    }

    next() {
        switch (this) {
        case Sort.NONE: return Sort.ASC;
        case Sort.ASC : return Sort.DESC;
        case Sort.DESC: return Sort.NONE;
        default:
            throw new Error(this.toString());
        }
    }
}

Sort.NONE = new Sort('none', '\u2003');
Sort.ASC  = new Sort('ASC' , '\u25b2');
Sort.DESC = new Sort('DESC', '\u25bc');

class SortHub {
    constructor() {
        this.locked = false;
        this.sorters = new Map();
        this.encounteredSingleAtMostNonNone = false;
        this.referencesUsed = null;
    }
    add(getter, setter, ref=null) {
        assert(typeof getter === typeof (function(){}));
        assert(typeof setter === typeof (function(){}));
        assert((ref===null) || (typeof ref === typeof {}));
        assert(!this.locked);
        if (this.referencesUsed===null)
            this.referencesUsed = !(ref===null);
        assert( ((!this.referencesUsed && (ref===null)) || (this.referencesUsed && (ref!==null)))
                , 'it is assumed that references are either *used* or *not used* in all add calls');
        const key = this.sorters.size+1;
        if (getter()!==Sort.NONE) {
            if (this.encounteredSingleAtMostNonNone)
                throw new Error();
            else {
                this.encounteredSingleAtMostNonNone = true;
            }
        }
        this.sorters.set(key, {getter: getter, setter: setter, ref: ref});
        return ()=>{this.notify(key);};
    }
    notify(key) {
        assert(this.locked);
        if (key===null)
            throw new Error();
        if (!this.sorters.has(key))
            throw new Error();
        if (this.sorters.get(key).getter()!==Sort.NONE)
            this.clearAllBut(key);
    }
    returnSingleNonNoneRef() {
        assert(this.locked);
        assert(this.referencesUsed===true, `references where not used while adding sorters, you can't ask for one now`);
        const singleAtMostNonNull = (function() {
            let candidateRV = null;
            for (let v of this.sorters.values()) {
                if (v.getter()!==Sort.NONE) {
                    assert(candidateRV===null, 'more than one non-NONE sorters found');
                    candidateRV = v.ref;
                }
            }
            return candidateRV;
        }.bind(this))();
        return singleAtMostNonNull;
    }
    clearAllBut(_key) {
        assert(this.locked);
        let nonNoneEncountered = false;
        for (let [key, value] of this.sorters) {
            if (key===_key)
                continue;
            if (value.getter()!==Sort.NONE) {
                if (nonNoneEncountered)
                    throw new Error();
                else
                    nonNoneEncountered = true;
                value.setter(Sort.NONE);
            }
        }
    }
    lock() {
        assert(!this.locked, 'while not strictly a mistake to lock twice, it may point to a bug in your code');
        assert(this.referencesUsed!=null, 'hub locked without adding a single sorter; why would you want to do that?');
        this.locked = true;
        delete this.encounteredSingleAtMostNonNone; // shouldn't be used after this point
    }

}


class SortHolder {
    constructor(sortHub=null, initialValue=Sort.NONE) {
        this.v = initialValue;
        if (sortHub!==null) {
            this.notify = 
                sortHub.add(function() {return this.v;}.bind(this),
                            function(v) {this.v = v;}.bind(this),
                            this);
        }
    }
    next() {
        this.v = this.v.next();
        if (this.notify != null)
            this.notify();
    }


}

module.exports = {
    Sort: Sort,
    SortHub: SortHub,
    SortHolder: SortHolder
};
