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
import {ExpiryMode} from "../literal";

export interface CacheHash<A extends TR, N extends Id> extends ShiftSecureFlat<CacheHashSecure<A, N>, CacheHashDef> {

    // region get
    getValue(key: KeyAny, field: FieldId<A>): Promise<CacheInvalidatorResult<A, string>>;
    getMore(key: KeyAny, fields: FieldIddArray<A>): Promise<CacheInvalidatorResult<A, Record<string, string>>>;
    getAll(key: KeyAny): Promise<CacheInvalidatorResult<A, Record<string, string>>>;
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
    exists(key: KeyAny, field: FieldId<A>): Promise<CacheInvalidatorResult<A, boolean>>;
    existMore(key: KeyAny, fields: FieldIddArray<A>): Promise<CacheInvalidatorResult<A, Array<boolean>>>;

    // endregion exists

    // region expire
    setTtl(key: KeyAny, fields: FieldIddArray<A>, opt?: CmdHashSetTtl): Promise<CacheInvalidatorResult<A, Record<string, CacheHashExpireResult>>>;

    setTimestamp(key: KeyAny, fields: FieldIddArray<A>, opt?: CmdHashSetTimestamp): Promise<CacheInvalidatorResult<A, Record<string, CacheHashExpireResult>>>;

    getTimestamp(key: KeyAny, fields: FieldIddArray<A>, opt?: CmdHashGetTimestamp): Promise<CacheInvalidatorResult<A, Record<string, number>>>;

    getTtl(key: KeyAny, fields: FieldIddArray<A>, opt?: CmdHashGetTtl): Promise<CacheInvalidatorResult<A, Record<string, number>>>;

    persist(key: KeyAny, fields: FieldIddArray<A>): Promise<CacheInvalidatorResult<A, Record<string, number>>>;

    // endregion expire

    // region field-values
    listFields(key: KeyAny): Promise<CacheInvalidatorResult<A, FieldIddArray<A>>>;

    getLength(key: KeyAny): Promise<CacheInvalidatorResult<A, number>>;

    // endregion field-values
}

export interface CacheHashSecure<A extends TR, N extends Id> extends ShiftMain<CacheHash<A, N>> {
    $set(key: string, record: Record<string, string>): Promise<number>;

    $delete(key: string, fields: Array<string>): Promise<number>;

    $getOne(key: string, field: string): Promise<string>;
    $get(key: string, fields: Array<string>): Promise<Array<string>>;
    $getAll(key: string): Promise<Record<string, string>>;

    $exists(key: string, field: string): Promise<boolean>;
    $existsMore(key: string, fields: Array<string>): Promise<Record<string, boolean>>;

    $setTtl(key: string, fields: Array<string>, milliseconds: number, mode?: ExpiryMode): Promise<Array<CacheHashExpireResult>>;

    $setTimestamp(key: string, fields: Array<string>, milliseconds: number, mode?: ExpiryMode): Promise<Array<CacheHashExpireResult>>;

    $getTimestamp(key: string, fields: Array<string>): Promise<Array<number>>;
    $getTtl(key: string, fields: Array<string>): Promise<Array<number>>;

    $persist(key: string, fields: Array<string>): Promise<Array<number>>;

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
