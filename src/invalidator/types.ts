import {CacheChannel, CacheID, TR} from "../channel";

export interface DummyInvalidator<A extends TR, N extends CacheID, C> {
    getZero(channel: CacheChannel<A, N, C>): CacheInvalidator<A, N, C, number>;
    getNumber(channel: CacheChannel<A, N, C>, result: number): CacheInvalidator<A, N, C, number>;
    getUndefined<R>(channel: CacheChannel<A, N, C>): CacheInvalidator<A, N, C, R>;
    getNull<R>(channel: CacheChannel<A, N, C>): CacheInvalidator<A, N, C, R>;
    getArray<R>(channel: CacheChannel<A, N, C>): CacheInvalidator<A, N, C, Array<R>>;
    getRecord<R>(channel: CacheChannel<A, N, C>): CacheInvalidator<A, N, C, Record<string, R>>;
    getTrue(channel: CacheChannel<A, N, C>): CacheInvalidator<A, N, C, boolean>;
    getFalse(channel: CacheChannel<A, N, C>): CacheInvalidator<A, N, C, boolean>;
}

export interface CacheInvalidator<A extends TR, N extends CacheID, C, T> {
    readonly result: T;
    readonly keys: Array<string>;
    add(id: CacheID): CacheInvalidator<A, N, C, T>;
    add(ids: Array<CacheID>): CacheInvalidator<A, N, C, T>;
    add(id: CacheID, prefix: string): CacheInvalidator<A, N, C, T>;
    add(ids: Array<CacheID>, prefix: string): CacheInvalidator<A, N, C, T>;
    add(id: CacheID, channel: CacheChannel<A, N, C>): CacheInvalidator<A, N, C, T>;
    add(ids: Array<CacheID>, channel: CacheChannel<A, N, C>): CacheInvalidator<A, N, C, T>;
    clear(id: CacheID): CacheInvalidator<A, N, C, T>;
    clear(ids: Array<CacheID>): CacheInvalidator<A, N, C, T>;
}

export interface PropInvalidator<A extends TR, N extends CacheID, C> {
    add(memberFull: string, identifiers: Array<CacheID>, prefix?: string): void;
    remove(identifier: CacheID, prefix?: string): void;
}
