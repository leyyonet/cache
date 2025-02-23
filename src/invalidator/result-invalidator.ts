import {CacheInvalidator} from "./types";
import {CacheChannel, CacheID, TR} from "../channel";

class CacheInvalidatorImpl<A extends TR, N extends CacheID, C, T> implements CacheInvalidator<A, N, C, T> {

    readonly result: T;
    readonly keys: Array<string>;
    private readonly channel: CacheChannel<A, N, C>;
    private readonly _dummy: boolean;

    constructor(channel: CacheChannel<A, N, C>, keys: Array<string>, result: T, dummy?: boolean) {
        this.keys = keys;
        this.result = result;
        this.channel = channel;
        this._dummy = dummy;
    }

    add(v1: CacheID|Array<CacheID>, channel?: CacheChannel<A, N, C>): CacheInvalidator<A, N, C, T> {
        if (this._dummy) {
            return this;
        }
        if (this.keys.length < 1) {
            return this;
        }
        if (!this.channel.prop.enabled) {
            return this;
        }
        const ids = this.channel.util.asKeys(v1);
        if (ids) {
            if (channel) {
                this.keys.forEach(member => channel.invalidator.add(member, ids));
            }
            else {
                this.keys.forEach(member => this.channel.invalidator.add(member, ids));
            }
        }
        return this;
    }
    clear(v1: CacheID|Array<CacheID>): CacheInvalidator<A, N, C, T> {
        if (this._dummy) {
            return this;
        }
        if (!this.channel.prop.enabled) {
            return this;
        }
        const ids = this.channel.util.asKeys(v1);
        if (ids) {
            ids.forEach(id => this.channel.invalidator.remove(id));
        }
        return this;

    }
}
export const invalidator = <A extends TR, N extends CacheID, C, T>(channel: CacheChannel<A, N, C>, keys: Array<string>, result: T, dummy?: boolean): CacheInvalidator<A, N, C, T> => {
  return new CacheInvalidatorImpl(channel, keys, result, dummy);
}
