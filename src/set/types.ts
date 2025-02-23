import {CacheID, CacheKey, TR} from "../channel";
import {CacheInvalidator} from "../invalidator";

export interface CacheSet<A extends TR, N extends CacheID, C> {
    get flattenGeneric$(): CacheSetDef;
    // region add
    add(key: CacheKey<A>, members: Array<N>): Promise<CacheInvalidator<A, N, C, number>>;
    // endregion add

    // region remove
    remove(key: CacheKey<A>, members: Array<N>): Promise<CacheInvalidator<A, N, C, number>>;
    // endregion remove

    // region members
    members(key: CacheKey<A>): Promise<Array<string>>;
    length(key: CacheKey<A>): Promise<number>;
    // endregion members

    // region exists
    isMember(key: CacheKey<A>, member: N): Promise<boolean>;
    areMembers(key: CacheKey<A>, members: Array<N>): Promise<Record<string, boolean>>;
    // endregion exists
}
export type CacheSetDef = CacheSet<TR, string, unknown>;
export interface CacheSetMembers {
    items: Array<string>;
    duplicated?: boolean;
}
