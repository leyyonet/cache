import {
    FieldId,
    FieldIddArray,
    FieldMap,
    FieldTupleArray,
    FieldValue,
    FieldValueArray,
    Id,
    KeyAny,
    SameType,
    TR
} from "../types";
import {CacheInvalidatorResult} from "../invalidator";
import {CacheOptExpiryMode, CacheOptExpiryUnit, CacheOptExpiryUnitTuple} from "../command";
import {ShiftMain, ShiftSecureFlat} from "../secure";

export interface CacheHash<A extends TR, N extends Id> extends ShiftSecureFlat<CacheHashSecure<A, N>, CacheHashDef> {

    // region get
    getValue(key: KeyAny, field: FieldId<A>): Promise<FieldValue<A>>;

    listValues(key: KeyAny, fields: FieldId<A>): Promise<FieldValueArray<A>>;

    getDoc(key: KeyAny, fields: FieldIddArray<A>): Promise<Partial<A>>;

    // endregion get

    // region set
    setValue(key: KeyAny, field: FieldId<A>, value: FieldValue<A>): Promise<CacheInvalidatorResult<A, number>>;

    setValuesMore(key: KeyAny, doc: Partial<A>): Promise<CacheInvalidatorResult<A, number>>;

    setValuesMore(key: KeyAny, map: FieldMap<A>): Promise<CacheInvalidatorResult<A, number>>;

    setValuesMore(key: KeyAny, tuples: FieldTupleArray<A>): Promise<CacheInvalidatorResult<A, number>>;

    // endregion set

    // region delete
    delete(key: KeyAny, fields: FieldIddArray<A>): Promise<CacheInvalidatorResult<A, number>>;

    // endregion delete

    // region exists
    exists(key: KeyAny, fields: FieldIddArray<A>): Promise<SameType<A, boolean>>;

    // endregion exists

    // region expire
    setTtl(key: KeyAny, fields: FieldIddArray<A>, opt?: CmdHashSetTtl): Promise<SameType<A, CacheHashExpireResult>>;

    setTimestamp(key: KeyAny, fields: FieldIddArray<A>, opt?: CmdHashSetTimestamp): Promise<SameType<A, CacheHashExpireResult>>;

    getTimestamp(key: KeyAny, fields: FieldIddArray<A>, opt?: CmdHashGetTimestamp): Promise<SameType<A, number>>;

    getTtl(key: KeyAny, fields: FieldIddArray<A>, opt?: CmdHashGetTtl): Promise<SameType<A, number>>;

    persist(key: KeyAny, fields: FieldIddArray<A>): Promise<SameType<A, number>>;

    // endregion expire

    // region field-values
    listFields(key: KeyAny): Promise<FieldIddArray<A>>;

    getLength(key: KeyAny): Promise<number>;

    // endregion field-values
}

export interface CacheHashSecure<A extends TR, N extends Id> extends ShiftMain<CacheHash<A, N>> {
    $set(key: string, record: Record<string, string>): Promise<number>;

    $delete(key: string, fields: Array<string>): Promise<number>;

    $get(key: string, fields: Array<string>): Promise<Array<string>>;

    $getAll(key: string): Promise<Record<string, string>>;

    $exists(key: string, fields: Array<string>): Promise<Record<string, number>>;

    $setTtl(key: string, fields: Array<string>, opt?: CmdHashSetTtl): Promise<Record<string, CacheHashExpireResult>>;

    $setTimestamp(key: string, fields: Array<string>, opt?: CmdHashSetTimestamp): Promise<Record<string, CacheHashExpireResult>>;

    $getTimestamp(key: string, fields: Array<string>, opt?: CmdHashGetTimestamp): Promise<Record<string, number>>;

    $getTtl(key: string, fields: Array<string>, opt?: CmdHashGetTtl): Promise<Record<string, number>>;

    $persist(key: string, fields: Array<string>): Promise<Record<string, number>>;

    $fields(key: string): Promise<Array<string>>;

    $length(key: string): Promise<number>;

}

export type CacheHashDef = CacheHash<TR, Id>;
export type CacheFieldValue<A extends TR> = A[keyof A] | string | number;

/**
 * -2: The field does not exist
 * 0: Specified NX | XX | GT | LT condition not met
 * 1: Expiration time was set or updated
 * 2: Field deleted because the specified expiration time is in the past
 * */
export type CacheHashExpireResult = -2 | 0 | 1 | 2;

/**
 * Expire command options
 *
 * @see CacheOptExpiryUnitTuple
 * @see CacheOptExpiryMode
 * */
export type CmdHashSetTtl = CacheOptExpiryUnitTuple & CacheOptExpiryMode;

/**
 * Expire at command options
 *
 * @see CacheOptExpiryUnitTuple
 * @see CacheOptExpiryMode
 * */
export type CmdHashSetTimestamp = CacheOptExpiryUnitTuple & CacheOptExpiryMode;


/**
 * Get ttl (remaining time) command options
 *
 * @see CacheOptExpiryUnit
 * */
export type CmdHashGetTtl = CacheOptExpiryUnit;

/**
 * Get expire time (timestamp) command options
 *
 * @see CacheOptExpiryUnit
 * */
export type CmdHashGetTimestamp = CacheOptExpiryUnit;
