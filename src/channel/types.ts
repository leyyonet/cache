import {CacheClientLike} from "../client";
import {CacheHash} from "../hash";
import {CacheBasic} from "../basic";
import {CacheSet} from "../set";
import {PropInvalidator} from "../invalidator";
import {CacheUtil} from "../util";
import {CachePropReadonly} from "../prop";

export interface CacheChannel<A extends TR, N extends CacheID, C> {
    // region properties
    readonly client: CacheClientLike<C>;
    readonly util: CacheUtil;
    readonly prop: CachePropReadonly<A>;
    // endregion properties

    // region plugins
    get hash(): CacheHash<A, N, C>;
    get basic(): CacheBasic<A, N, C>;
    get set(): CacheSet<A, N, C>;
    get invalidator(): PropInvalidator<A, N, C>;
    // endregion plugins
}

export type CacheID = string | number;
export type CacheKey<A extends TR> = CacheID | [CacheID, keyof A];

export type TR = Record<string, unknown>;
