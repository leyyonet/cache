import {cacheUtil, CacheUtil} from "../util";
import {CacheClientLike} from "../client";
import {CacheID, TR} from "./types";
import {CacheChannel} from "./types";
import {CachePropCompleted, CachePropReadonly} from "../prop";
import {CacheHash} from "../hash";
import {CacheBasic} from "../basic";
import {CacheSet} from "../set";
import {PropInvalidator} from "../invalidator";

// noinspection JSUnusedGlobalSymbols,TypeScriptAbstractClassConstructorCanBeMadeProtected
export abstract class CacheChannelAbstract<A extends TR, N extends CacheID, C> implements CacheChannel<A, N, C> {

    // region properties
    protected _hash: CacheHash<A, N, C>;
    protected _basic: CacheBasic<A, N, C>;
    protected _set: CacheSet<A, N, C>;
    protected _invalidator: PropInvalidator<A, N, C>;
    readonly client: CacheClientLike<C>;
    readonly util: CacheUtil;
    readonly prop: CachePropReadonly<A>;
    // endregion properties

    // region constructor
    constructor(client: CacheClientLike<C>, prop: CachePropCompleted<A>) {
        this.client = client;
        this.prop = prop as CachePropReadonly<A>;
        this.util = cacheUtil;
    }
    // endregion constructor

    // region plugins
    abstract get hash(): CacheHash<A, N, C>;
    abstract get basic(): CacheBasic<A, N, C>;
    abstract get set(): CacheSet<A, N, C>;
    abstract get invalidator(): PropInvalidator<A, N, C>;
    // endregion plugins

}