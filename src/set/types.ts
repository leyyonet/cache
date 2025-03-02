import {CacheInvalidatorResult} from "../invalidator";
import {Id, KeyAny, TR} from "../types";
import {ShiftMain, ShiftSecureFlat} from "../secure";

export interface CacheSet<A extends TR, N extends Id> extends ShiftSecureFlat<CacheSetSecure<A, N>, CacheSetDef> {

    // region add
    add(key: KeyAny, members: Array<N>): Promise<CacheInvalidatorResult<A, number>>;

    // endregion add

    // region remove
    remove(key: KeyAny, members: Array<N>): Promise<CacheInvalidatorResult<A, number>>;

    // endregion remove

    // region members
    listMembers(key: KeyAny): Promise<CacheInvalidatorResult<A, Array<string>>>;

    getLength(key: KeyAny): Promise<CacheInvalidatorResult<A, number>>;

    // endregion members

    // region exists
    exists(key: KeyAny, member: N): Promise<CacheInvalidatorResult<A, boolean>>;

    existMore(key: KeyAny, members: Array<N>): Promise<CacheInvalidatorResult<A, Array<boolean>>>;

    // endregion exists
}

export interface CacheSetSecure<A extends TR, N extends Id> extends ShiftMain<CacheSet<A, N>> {

    $add(key: string, members: Array<string>): Promise<number>;
    $remove(key: string, members: Array<string>): Promise<number>;
    $list(key: string): Promise<Array<string>>;
    $length(key: string): Promise<number>;
    $exist(key: string, member: string): Promise<boolean>;

}

export type CacheSetDef = CacheSet<TR, Id>;