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
    }
    add(getter, setter) {
        if (this.locked)
            throw new Error();

        const key = this.sorters.size+1;
        if (getter()!==Sort.NONE) {
            if (this.encounteredSingleAtMostNonNone)
                throw new Error();
            else {
                this.encounteredSingleAtMostNonNone = true;
            }
        }
        this.sorters.set(key, {getter: getter, setter: setter});
        return ()=>{this.notify(key);};
    }
    notify(key) {
        if (key===null)
            throw new Error();
        if (!this.sorters.has(key))
            throw new Error();
        if (this.sorters.get(key).getter()!==Sort.NONE)
            this.clearAllBut(key);
    }
    clearAllBut(_key) {
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
        this.locked = true;
        delete this.encounteredSingleAtMostNonNone; // shouldn't be used after this point
    }

}


module.exports = {
    Sort: Sort,
    SortHub: SortHub
};
