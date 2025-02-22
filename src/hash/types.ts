import {CacheID, CacheKey, TR} from "../channel";
import {CacheInvalidator} from "../invalidator";
import {CacheCmdExpire, CacheCmdExpireAt, CacheCmdInc, CacheCmdTtl} from "../command";

export interface CacheHash<A extends TR, N extends CacheID, C> {

    // region get
    getAll(key: CacheKey<A>): Promise<CacheFieldPartial<A>>;
    getOne(key: CacheKey<A>, field: CacheFieldIn<A>): Promise<CacheFieldValue<A>>;
    getMore(key: CacheKey<A>, fields: CacheFieldsIn<A>): Promise<CacheFieldPartial<A>>;
    // endregion get

    // region set
    setOne(key: CacheKey<A>, field: CacheFieldIn<A>, value: CacheFieldValue<A>): Promise<CacheInvalidator<A, N, C, number>>;
    setMore(key: CacheKey<A>, doc: CacheFieldPartialIn<A>): Promise<CacheInvalidator<A, N, C, number>>;
    setMore(key: CacheKey<A>, map: CacheFieldMap<A>): Promise<CacheInvalidator<A, N, C, number>>;
    setMore(key: CacheKey<A>, tuples: CacheFieldTuples<A>): Promise<CacheInvalidator<A, N, C, number>>;
    // endregion set

    // region delete
    deleteOne(key: CacheKey<A>, field: CacheFieldIn<A>): Promise<CacheInvalidator<A, N, C, number>>;
    deleteMore(key: CacheKey<A>, fields: CacheFieldsIn<A>): Promise<CacheInvalidator<A, N, C, number>>;
    // endregion delete

    // region exists
    hasField(key: CacheKey<A>, field: CacheFieldIn<A>): Promise<boolean>;
    hasFields(key: CacheKey<A>, fields: CacheFieldsIn<A>): Promise<Record<string, boolean>>;
    // endregion exists

    // region expire
    expire(key: CacheKey<A>, fields: CacheFieldsIn<A>, opt?: CacheCmdExpire): Promise<Record<string, CacheHashExpireResult>>;
    expireAt(key: CacheKey<A>, fields: CacheFieldsIn<A>, opt?: CacheCmdExpireAt): Promise<Record<string, CacheHashExpireResult>>;
    expireTime(key: CacheKey<A>, fields: CacheFieldsIn<A>, opt?: CacheCmdTtl): Promise<Record<string, number>>;
    ttl(key: CacheKey<A>, fields: CacheFieldsIn<A>, opt?: CacheCmdTtl): Promise<Record<string, number>>;
    persist(key: CacheKey<A>, fields: CacheFieldsIn<A>): Promise<Record<string, number>>;
    // endregion expire

    // region increment
    increment(key: CacheKey<A>, field: CacheFieldIn<A>, opt: CacheCmdInc): Promise<CacheInvalidator<A, N, C, number>>;
    // endregion increment

    // region field-values
    fields(key: CacheKey<A>): Promise<CacheFields<A>>;
    length(key: CacheKey<A>): Promise<number>;
    values(key: CacheKey<A>, fields: CacheFieldsIn<A>): Promise<CacheFieldValues<A>>;
    allValues(key: CacheKey<A>): Promise<CacheFieldValues<A>>;
    // endregion field-values

    // region random
    randomOne(key: CacheKey<A>): Promise<CacheField<A>>;
    randomMore(key: CacheKey<A>, count: number): Promise<CacheFields<A>>;
    randomValues(key: CacheKey<A>, count: number): Promise<CacheFieldPartial<A>>;
    // endregion random
}
export type CacheField<A extends TR> = keyof A | string;
export type CacheFields<A extends TR> = Array<CacheField<A>>;
export type CacheFieldIn<A extends TR> = CacheField<A> | number;
export type CacheFieldsIn<A extends TR> = Array<CacheFieldIn<A>>;

export type CacheFieldValue<A extends TR> = A[keyof A]|string|number;
export type CacheFieldValues<A extends TR> = Array<CacheFieldValue<A>>;

export type CacheFieldPartial<A extends TR> = Partial<A> | Record<string, string>;
export type CacheFieldPartialIn<A extends TR> = Partial<A> | Record<CacheField<A>, string>;
export type CacheFieldTuples<A extends TR> = Array<[CacheFieldIn<A>, CacheFieldValue<A>]>;
export type CacheFieldMap<A extends TR> = Map<CacheFieldIn<A>,  CacheFieldValue<A>>

export interface CacheHashFields {
    items: Array<string>;
    duplicated?: boolean;
}

/**
 * -2: The field does not exist
 * 0: Specified NX | XX | GT | LT condition not met
 * 1: Expiration time was set or updated
 * 2: Field deleted because the specified expiration time is in the past
 * */
export type CacheHashExpireResult = -2|0|1|2;
