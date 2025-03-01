import {CacheAbstractPropImpl} from "../prop";
import {CacheChannelProp, CacheChannelPropData, CacheChannelPropDef, CacheChannelPropSecure} from "./types";
import {CacheEntityPropData} from "../entity";
import {OneOrMore} from "../types";

// noinspection JSUnusedGlobalSymbols
export class CacheChannelPropImpl<A> extends CacheAbstractPropImpl implements CacheChannelProp<A>, CacheChannelPropSecure<A> {
    property: OneOrMore<keyof A>;

    constructor(data: CacheEntityPropData<A> | CacheChannelPropData<A>, parent: CacheEntityPropData<A>) {
        // const validators = new Map<string, CachePropValidator>();
        // validators.set('property', property => this._parseProperties(property));
        super(data, parent);
    }

    // region secure
    get $flat(): CacheChannelPropDef {
        return this as CacheChannelPropDef;
    }

    get $secure(): CacheChannelPropSecure<A> {
        return this;
    }

    get $back(): CacheChannelProp<A> {
        return this;
    }

    get $pure(): Partial<CacheChannelPropData<A>> {
        return this._pure as Partial<CacheChannelPropData<A>>;
    }

    $setPure(pure: Partial<CacheChannelPropData<A>>): void {
        this._setPure(pure);
    }

    // endregion secure
}