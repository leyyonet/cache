import {CacheAbstractPropImpl} from "../prop";
import {CacheEntityProp, CacheEntityPropData, CacheEntityPropDef, CacheEntityPropSecure} from "./types";
import {CacheSegmentPropData} from "../segment";
import {OneOrMore} from "../types";

// noinspection JSUnusedGlobalSymbols
export class CacheEntityPropImpl<A> extends CacheAbstractPropImpl implements CacheEntityProp<A>, CacheEntityPropSecure<A> {
    property: OneOrMore<keyof A>;

    constructor(data: CacheSegmentPropData | CacheEntityPropData<A>, parent: CacheSegmentPropData) {
        super(data, parent)
    }

    // region secure
    get $flat(): CacheEntityPropDef {
        return this as CacheEntityPropDef;
    }

    get $secure(): CacheEntityPropSecure<A> {
        return this;
    }

    get $back(): CacheEntityProp<A> {
        return this;
    }

    get $pure(): Partial<CacheEntityPropData<A>> {
        return this._pure as Partial<CacheEntityPropData<A>>;
    }

    $setPure(pure: Partial<CacheEntityPropData<A>>): void {
        this._setPure(pure);
    }

    // endregion secure


}