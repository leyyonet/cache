import {CacheChannel, CacheID, CacheKey, TR} from "../channel";
import {CacheClientLike} from "../client";
import {CachePropReadonly} from "../prop";
import {CacheUtil} from "../util";
import {CacheBase, CacheBaseKey, CacheBaseKeys} from "./types";

export abstract class CacheBaseAbstract<A extends TR, N extends CacheID, C> implements CacheBase<A, N, C> {
    protected readonly channel: CacheChannel<A, N, C>;
    protected readonly client: CacheClientLike<C>;
    protected readonly util: CacheUtil;
    protected readonly prop: CachePropReadonly<A>;

    constructor(channel: CacheChannel<A, N, C>) {
        this.channel = channel;
        this.client = channel.client as CacheClientLike<C>;
        this.util = channel.util;
        this.prop = channel.prop;
    }
    private _formatKey(short: string, variant?: string): CacheBaseKey {
        if (!variant) {
            return {short, full: `${this.prop.prefix}${short}`}
        }
        return this._formatKey(`${short}/${variant}`);
    }
    protected _checkKey(key: CacheKey<A>): CacheBaseKey {
        if (Array.isArray(key)) {
            const [id, property] = key;
            const short = this.util.asKey(id);
            if (!short) {
                return {};
            }
            let variant = this.util.asKey(property);
            if (variant === this.prop.property) {
                variant = null;
            }
            return this._formatKey(short, variant);
        }
        let short = this.util.asKey(key);
        if (!short) {
            return {};
        }
        return this._formatKey(short);
    }
    protected _checkKeys(keys: Array<CacheKey<A>>): CacheBaseKeys {
        if (!Array.isArray(keys) || keys.length < 1) {
            return {shorts: [], fulls: []};
        }
        const result = keys
            .map(id => this._checkKey(id))
            .filter(id => id.short !== null)
            .filter((value, index, array) => array.findIndex(x => x.short === value.short) === index);
        // myArray.filter((value, index, array) => array.indexOf(value) === index)
        return {shorts: result.map(i => i.short), fulls: result.map(i => i.full), duplicated: keys.length > result.length};
    }

}