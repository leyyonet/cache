import {CacheChannel, CacheID, TR} from "../channel";
import {CacheInvalidator, DummyInvalidator} from "./types";
import {invalidator} from "./result-invalidator";

class DummyInvalidatorImpl<A extends TR, N extends CacheID, C> implements DummyInvalidator<A, N, C> {
    private readonly _number: Map<number, CacheInvalidator<A, N, C, number>>;
    private _zero: CacheInvalidator<A, N, C, number>;
    private _undefined: CacheInvalidator<A, N, C, unknown>;
    private _null: CacheInvalidator<A, N, C, unknown>;
    private _array: CacheInvalidator<A, N, C, Array<unknown>>;
    private _record: CacheInvalidator<A, N, C, Record<string, unknown>>;
    private _true: CacheInvalidator<A, N, C, boolean>;
    private _false: CacheInvalidator<A, N, C, boolean>;

    constructor() {
        this._number = new Map();
    }

    getNumber(channel: CacheChannel<A, N, C>, result: number): CacheInvalidator<A, N, C, number> {
        if (result === 0) {
            return this.getZero(channel);
        }
        if (!this._number.has(result)) {
            this._number.set(result, invalidator(channel, [], result, true));
        }
        return this._number.get(result);
    }
    getZero(channel: CacheChannel<A, N, C>): CacheInvalidator<A, N, C, number> {
        if (!this._zero) {
            this._zero = invalidator(channel, [], undefined, true);
        }
        return this._zero;

    }
    getUndefined<T>(channel: CacheChannel<A, N, C>): CacheInvalidator<A, N, C, T> {
        if (!this._undefined) {
            this._undefined = invalidator(channel, [], undefined, true);
        }
        return this._undefined as CacheInvalidator<A, N, C, T>;
    }
    getNull<T>(channel: CacheChannel<A, N, C>): CacheInvalidator<A, N, C, T> {
        if (!this._null) {
            this._null = invalidator(channel, [], null, true);
        }
        return this._null as CacheInvalidator<A, N, C, T>;
    }
    getArray<T>(channel: CacheChannel<A, N, C>): CacheInvalidator<A, N, C, Array<T>> {
        if (!this._array) {
            this._array = invalidator(channel, [], [], true);
        }
        return this._array as CacheInvalidator<A, N, C, Array<T>>;
    }
    getRecord<T>(channel: CacheChannel<A, N, C>): CacheInvalidator<A, N, C, Record<string, T>> {
        if (!this._record) {
            this._record = invalidator(channel, [], {}, true);
        }
        return this._record as CacheInvalidator<A, N, C, Record<string, T>>;
    }
    getTrue(channel: CacheChannel<A, N, C>): CacheInvalidator<A, N, C, boolean> {
        if (!this._true) {
            this._true = invalidator(channel, [], true, true);
        }
        return this._true as CacheInvalidator<A, N, C, boolean>;
    }
    getFalse(channel: CacheChannel<A, N, C>): CacheInvalidator<A, N, C, boolean> {
        if (!this._false) {
            this._false = invalidator(channel, [], false, true);
        }
        return this._false as CacheInvalidator<A, N, C, boolean>;
    }

}
const instance: DummyInvalidator<TR, string, unknown> = new DummyInvalidatorImpl<TR, string, unknown>();
export const dummyInvalidator = <A extends TR, N extends CacheID = string, C = unknown>():DummyInvalidator<A,  N, C> => (instance as DummyInvalidator<A,  N, C>);