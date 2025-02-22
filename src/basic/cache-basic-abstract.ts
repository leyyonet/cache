import {CacheBaseAbstract} from "../base";
import {CacheBasic} from "./types";
import {CacheID, CacheKey, TR} from "../channel";
import {CacheInvalidator} from "../invalidator";
import {CacheCmdCopy, CacheCmdExpire, CacheCmdExpireAt, CacheCmdSet, CacheCmdTtl} from "../command";

export abstract class CacheBasicAbstract<A extends TR, N extends CacheID, C> extends CacheBaseAbstract<A, N, C> implements CacheBasic<A, N, C> {

    // region get
    /** @inheritDoc */
    abstract get(key: CacheKey<A>): Promise<A>;

    /** @inheritDoc */
    abstract getMore(keys: Array<CacheKey<A>>): Promise<Record<CacheID, A>>;
    // endregion get

    // region set
    /** @inheritDoc */
    abstract set(key: CacheKey<A>, value: A, opt: Omit<CacheCmdSet, 'key'>): Promise<CacheInvalidator<A, N, C, A|boolean>>;
    /** @inheritDoc */
    abstract set(value: A, opt: CacheCmdSet): Promise<CacheInvalidator<A, N, C, A|boolean>>;
    /** @inheritDoc */
    abstract setMore(values: Record<CacheID, A>): Promise<CacheInvalidator<A, N, C, boolean>>;
    /** @inheritDoc */
    abstract setMore(values: Array<A>): Promise<CacheInvalidator<A, N, C, boolean>>;
    // endregion set

    // region exists
    /** @inheritDoc */
    abstract existsMore(keys: Array<CacheKey<A>>): Promise<number>;
    /** @inheritDoc */
    abstract exists(key: CacheKey<A>): Promise<boolean>;
    // endregion exists

    // region delete
    /** @inheritDoc */
    abstract deleteMore(keys: Array<CacheKey<A>>): Promise<CacheInvalidator<A, N, C, number>>;
    /** @inheritDoc */
    abstract delete(key: CacheKey<A>): Promise<CacheInvalidator<A, N, C, number>>;
    /** @inheritDoc */
    abstract unlinkMore(keys: Array<CacheKey<A>>): Promise<CacheInvalidator<A, N, C, number>>;
    /** @inheritDoc */
    abstract unlink(key: CacheKey<A>): Promise<CacheInvalidator<A, N, C, number>>;
    // endregion delete

    // region expire
    /** @inheritDoc */
    abstract expire(key: CacheKey<A>, opt?: CacheCmdExpire): Promise<boolean>;
    /** @inheritDoc */
    abstract expireAt(key: CacheKey<A>, opt?: CacheCmdExpireAt): Promise<boolean>;
    /** @inheritDoc */
    abstract expireTime(key: CacheKey<A>, opt?: CacheCmdTtl): Promise<number>;
    /** @inheritDoc */
    abstract ttl(key: CacheKey<A>, opt?: CacheCmdTtl): Promise<number>;
    /** @inheritDoc */
    abstract persist(key: CacheKey<A>): Promise<boolean>;
    // endregion expire

    // region other
    /** @inheritDoc */
    abstract copy(source: CacheKey<A>, destination: CacheKey<A>, opt?: CacheCmdCopy): Promise<boolean>;

    /** @inheritDoc */
    abstract type(key: CacheKey<A>): Promise<string>;
    // endregion other

}
