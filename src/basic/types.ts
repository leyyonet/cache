import {CacheInvalidatorResult} from "../invalidator";
import {
    CacheOptCopy,
    CacheOptExpiryMode,
    CacheOptExpiryUnit,
    CacheOptExpiryUnitTuple,
    CacheOptKey,
    CacheOptProperty,
    CacheOptReturnPrevious,
    CacheOptSaveMode,
    CacheOptSaveSpan, CacheResultGetExpiry,
    CacheResultInfo, CacheResultPersist, CacheResultSetExpiry
} from "../command";
import {Id, KeyAny, KeyAnyArray, KeyId, TR} from "../types";
import {ShiftMain, ShiftSecureFlat} from "../secure";
import {ExpiryMode} from "../literal";

export interface CacheBasic<A extends TR, N extends Id> extends ShiftSecureFlat<CacheBasicSecure<A, N>, CacheBasicDef> {

    /**
     * Get the value of key (from json)
     *
     * @param {KeyAny} key - key of data
     * @return {Promise<Object>} - Parsed value of key
     *
     * Notes:
     * - An error is returned if the value stored at key is not a string, because GET only handles string values.
     * - Value is parsed from json
     * */
    getDoc(key: KeyAny): Promise<CacheInvalidatorResult<A, A>>;
    listDocs(keys: KeyAnyArray): Promise<CacheInvalidatorResult<A, Array<A>>>;

    /**
     * Get the value of key
     *
     * @param {KeyAny} key - key of data
     * @return {Promise<Object>} - Parsed value of key
     *
     * Notes:
     * - An error is returned if the value stored at key is not a string, because GET only handles string values.
     * */
    getRaw<T>(key: KeyAny): Promise<CacheInvalidatorResult<A, T>>;
    listRaws<T>(keys: KeyAnyArray): Promise<CacheInvalidatorResult<A, Array<T>>>;

    /**
     * Sets value with given key in parameters
     *
     * @param {Object} value - data
     * @param {CmdBasicSetWithKey} opt - options
     * @return {Promise<Object|boolean>} - previous data or is success?
     *
     * Notes
     * - If key already holds a value, it is overwritten, regardless of its type.
     * - Any previous time to live associated with the key is discarded on successful SET operation.
     *
     * option(`key`)       details ==> {@link CacheOptKey}
     * option(`property`)  details ==> {@link CacheOptProperty}
     * option(`span`)      details ==> {@link CacheOptSaveSpan}
     * option(`expiry`)    details ==> {@link CacheOptExpiryUnitTuple}
     * option(`mode`)      details ==> {@link CacheOptSaveMode}
     *
     * option(`returnPrevious`): in {@link CmdBasicSetBase#returnPrevious}
     * Changes returning previous data strategy
     * - `true`  => returns previous data
     * - `false` => returns nothing
     *
     *
     * returns <one of them>
     * - Object => previous data of key, {@link CmdBasicSetBase#returnPrevious}
     * - false  => the key was not set
     * - true   => the key was set
     * */
    setDoc(value: Partial<A>, opt?: CmdBasicSetWithKey<A>): Promise<CacheInvalidatorResult<A, Partial<A> | boolean>>;

    /**
     * Sets value with given key (data is converted to json)
     *
     * @param {KeyAny} key - key of data
     * @param {Object} value - data
     * @param {CmdBasicSetBase?} opt - options
     * @return {Promise<Object|boolean>} - previous data or is success?
     *
     * @inheritDoc
     * {@link #setDoc} above for options
     * */
    setDoc(key: KeyAny, value: Partial<A>, opt?: CmdBasicSetBase): Promise<CacheInvalidatorResult<A, Partial<A> | boolean>>;

    /**
     * Sets value with given key
     *
     * @param {KeyAny} key - key of data
     * @param {Object} value - data
     * @param {CmdBasicSetBase?} opt - options
     * @return {Promise<Object|boolean>} - previous data or is success?
     *
     * @inheritDoc
     * {@link #setDoc} above for options
     * */
    setRaw<T extends string|number>(key: KeyAny, value: T, opt?: CmdBasicSetBase): Promise<CacheInvalidatorResult<A, string | boolean>>;

    /**
     * Sets multiple keys with given array of values
     *
     * @param {Array<Object>} values - array of values
     * @param {CmdBasicSetWithProp} opt - options
     * @return {Promise<boolean>} - is success?
     *
     * @inheritDoc
     * {@link #setDoc} above for options
     * */
    setDocsMore(values: Array<Partial<A>>, opt?: CmdBasicSetWithProp<A>): Promise<CacheInvalidatorResult<A, boolean>>;

    /**
     * Sets multiple keys with given record of values
     *
     * @param {Record<KeyId, Object>} records
     * @param {CmdBasicSetBase} opt - options
     * @return {Promise<boolean>} - is success?
     *
     * @inheritDoc
     * {@link #setDoc} above for options
     * */
    setDocsMore(records: Record<KeyId, Partial<A>>, opt?: CmdBasicSetBase): Promise<CacheInvalidatorResult<A, boolean>>;

    /**
     * Sets multiple keys with given map of values
     *
     * @param {Map<KeyId, Object>} map
     * @param {CmdBasicSetBase} opt - options
     * @return {Promise<boolean>} - is success?
     *
     * @inheritDoc
     * {@link #setDoc} above for options
     * */
    setDocsMore(map: Map<KeyId, Partial<A>>, opt?: CmdBasicSetBase): Promise<CacheInvalidatorResult<A, boolean>>;

    /**
     * Sets multiple keys with given tuple of values as [ [key-1, value-1], [key-2, value-2], ...]
     *
     * @param {Array<[KeyId, Object]>} tuples
     * @param {CmdBasicSetBase} opt - options
     * @return {Promise<boolean>} - is success?
     *
     * @inheritDoc
     * {@link #setDoc} above for options
     * */
    setDocsMore(tuples: Array<[KeyId, Partial<A>]>, opt?: CmdBasicSetBase): Promise<CacheInvalidatorResult<A, boolean>>;

    /**
     * Sets multiple keys with given record of values
     *
     * @param {Record<KeyId, Object>} records
     * @param {CmdBasicSetBase} opt - options
     * @return {Promise<boolean>} - is success?
     *
     * @inheritDoc
     * {@link #setDoc} above for options
     *
     * Note:
     * Data won't be converted to json string
     * */
    setRawsMore<T extends string|number>(records: Record<KeyId, T>, opt?: CmdBasicSetNoKey): Promise<CacheInvalidatorResult<A, boolean>>;

    /**
     * Sets multiple keys with given map of values
     *
     * @param {Map<KeyId, Object>} map
     * @param {CmdBasicSetBase} opt - options
     * @return {Promise<boolean>} - is success?
     *
     * @inheritDoc
     * {@link #setDoc} above for options
     * Data won't be converted to json string
     * */
    setRawsMore<T extends string|number>(map: Map<KeyId, T>, opt?: CmdBasicSetNoKey): Promise<CacheInvalidatorResult<A, boolean>>;

    /**
     * Sets multiple keys with given tuple of values as [ [key-1, value-1], [key-2, value-2], ...]
     *
     * @param {Array<[KeyId, Object]>} tuples
     * @param {CmdBasicSetBase} opt - options
     * @return {Promise<boolean>} - is success?
     *
     * @inheritDoc
     * {@link #setDoc} above for options
     * */
    setRawsMore<T extends string|number>(tuples: Array<[KeyId, T]>, opt?: CmdBasicSetNoKey): Promise<CacheInvalidatorResult<A, boolean>>;

    /**
     * Returns if key exists
     *
     * @param {KeyAny} key - key of data
     * @return {Promise<boolean>} - does the key exists?
     * */
    exists(key: KeyAny): Promise<CacheInvalidatorResult<A, boolean>>;

    /**
     * Returns if keys exist
     *
     * @param {KeyAnyArray} keys - keys of data
     * @return {Promise<number>} - the number of keys that exist
     * */
    existMore(keys: KeyAnyArray): Promise<CacheInvalidatorResult<A, number>>;

    /**
     * Removes the specified key. A key is ignored if it does not exist.
     *
     * @param {KeyAny} key - key of data
     * @return {Promise<number>} - the number of keys that were removed
     *
     * returns <one of them>
     * - 0 => key does not exist
     * - 1 => key was removed
     * */
    delete(key: KeyAny): Promise<CacheInvalidatorResult<A, boolean>>;

    /**
     * Removes the specified keys. A key is ignored if it does not exist.
     *
     * @param {KeyAnyArray} keys - keys of data
     * @return {Promise<number>} - the number of keys that were removed
     * */
    deleteMore(keys: KeyAnyArray): Promise<CacheInvalidatorResult<A, number>>;

    /**
     * Removes the specified key without blocking. A key is ignored if it does not exist.
     *
     * @param {KeyAny} key - key of data
     * @return {Promise<number>} - the number of keys that were removed
     *
     * returns <one of them>
     * - 0 => key does not exist
     * - 1 => key was removed
     *
     * Notes
     * - The actual removal will happen later asynchronously
     * */
    unlink(key: KeyAny): Promise<CacheInvalidatorResult<A, boolean>>;

    /**
     * Removes the specified keys without blocking. A key is ignored if it does not exist.
     *
     * @param {KeyAnyArray} keys - keys of data
     * @return {Promise<number>} - the number of keys that were removed
     *
     * Notes
     * - The actual removal will happen later asynchronously
     * */
    unlinkMore(keys: KeyAnyArray): Promise<CacheInvalidatorResult<A, number>>;

    /**
     * Sets a timeout on key as ttl.
     * After the timeout has expired, the key will automatically be deleted.
     *
     * @param {KeyAny} key - key of data
     * @param {CmdBasicSetTtl?} opt - options
     * @return {Promise<boolean>} - is success?
     *
     * option(`expiry`)  details ==> {@link CacheOptExpiryUnitTuple}
     * option(`mode`)    details ==> {@link CacheOptExpiryMode}
     *
     * returns <one of them>
     * - false => key does not exist
     * - true  => the timeout was set
     *
     * */
    setTtl(key: KeyAny, opt?: CmdBasicSetTtl): Promise<CacheInvalidatorResult<A, CacheResultSetExpiry>>;
    setTtlMore(keys: KeyAnyArray, opt?: CmdBasicSetTtl): Promise<CacheInvalidatorResult<A, Array<CacheResultSetExpiry>>>;

    /**
     * Sets a timeout on key with specific timestamp.
     * After the timeout has expired, the key will automatically be deleted.
     *
     * @param {KeyAny} key - key of data
     * @param {CmdBasicSetTimestamp?} opt - options
     * @return {Promise<boolean>} - is success?
     *
     * option(`expiry`)  details ==> {@link CacheOptExpiryUnitTuple}
     * option(`mode`)    details ==> {@link CacheOptExpiryMode}
     *
     * returns <one of them>
     * - false => key does not exist
     * - true  => the timeout was set
     *
     * */
    setTimestamp(key: KeyAny, opt?: CmdBasicSetTimestamp): Promise<CacheInvalidatorResult<A, CacheResultSetExpiry>>;
    setTimestampMore(keys: KeyAnyArray, opt?: CmdBasicSetTtl): Promise<CacheInvalidatorResult<A, Array<CacheResultSetExpiry>>>;

    /**
     * Returns the absolute Unix timestamp (since January 1, 1970) at which the given key will expire
     *
     * @param {KeyAny} key - key of data
     * @param {CmdBasicGetTimestamp?} opt - options
     * @return {Promise<number>} - return remaining time based on option
     *
     * option(`unit`) => details {@link CacheOptExpiryUnit}
     *
     * returns <one of them>
     * - (-1)              => the key exists but has no associated expiration time.
     * - (-2)              => the key does not exist.
     * - .... seconds      => exact timestamp as seconds {@link CmdBasicGetTimestamp#unit}
     * - .... milliseconds => exact timestamp as milliseconds {@link CmdBasicGetTimestamp#unit}
     * - .... minutes      => exact timestamp as minutes {@link CmdBasicGetTimestamp#unit}
     *
     * */
    getTimestamp(key: KeyAny, opt?: CmdBasicGetTimestamp): Promise<CacheInvalidatorResult<A, CacheResultGetExpiry>>;
    getTimestampMore(keys: KeyAnyArray, opt?: CmdBasicGetTimestamp): Promise<CacheInvalidatorResult<A, Array<CacheResultGetExpiry>>>;

    /**
     * Returns the remaining time to live of a key that has a timeout.
     *
     * @param {KeyAny} key - key of data
     * @param {CmdBasicGetTtl?} opt - options
     * @return {Promise<number>} - return remaining time based on option
     *
     * option(`unit`) details => {@link CacheOptExpiryUnit}
     *
     * returns <one of them>
     * - (-1)              => the key exists but has no associated expiration time.
     * - (-2)              => the key does not exist.
     * - .... seconds      => remaining seconds {@link CmdBasicGetTtl#unit}
     * - .... milliseconds => remaining milliseconds {@link CmdBasicGetTtl#unit}
     * - .... minutes      => remaining minutes {@link CmdBasicGetTtl#unit}
     *
     * */
    getTtl(key: KeyAny, opt?: CmdBasicGetTtl): Promise<CacheInvalidatorResult<A, CacheResultGetExpiry>>;
    getTtlMore(keys: KeyAnyArray, opt?: CmdBasicGetTtl): Promise<CacheInvalidatorResult<A, Array<CacheResultGetExpiry>>>;

    /**
     * Removes the existing timeout on key
     *
     * @param {KeyAny} key - key of data
     * @return {Promise<boolean>} - is success?
     *
     * returns <one of them>
     * - false => key does not exist or does not have an associated timeout.
     * - true  => the timeout has been removed.
     * */
    persist(key: KeyAny): Promise<CacheInvalidatorResult<A, CacheResultPersist>>;
    persistMore(keys: KeyAnyArray): Promise<CacheInvalidatorResult<A, Array<CacheResultPersist>>>;

    /**
     * Copies the value stored at the source key to the destination key
     *
     * @param {KeyAny} source - source key
     * @param {KeyAny} destination - destination key
     * @param {CmdBasicCopy?} opt - options
     * @return {Promise<boolean>} - is success?
     *
     * options
     * - Logical database index, {@link CmdBasicCopy#destinationDb}
     * - It replace if exists, {@link CmdBasicCopy#replace}
     *
     * Notes
     * - By default, the destination key is created in the logical database used by the connection.
     * - The DB option allows specifying an alternative logical database index for the destination key
     * - It returns false when the destination key already exists if replace is not used
     *
     * returns <one of them>
     * - false => source was not copied
     * - true  => source was copied
     * */
    copy(source: KeyAny, destination: KeyAny, opt?: CmdBasicCopy): Promise<CacheInvalidatorResult<A, boolean>>;

    /**
     * Returns the string representation of the type of the value stored at key
     *
     * @param {KeyAny} key - key of data
     * @return {Promise<string>} - type of data
     *
     * Notes
     * - By default, the destination key is created in the logical database used by the connection.
     * - The DB option allows specifying an alternative logical database index for the destination key
     * - It returns false when the destination key already exists if replace is not used
     *
     * returns <one of them>
     * - string => type of key
     * - null  => when key doesn't exist
     * */
    getType(key: KeyAny): Promise<CacheInvalidatorResult<A, string>>;
    getTypeMore(keys: KeyAnyArray): Promise<CacheInvalidatorResult<A, Array<string>>>;

    /**
     * Returns detailed info about the key
     *
     * @param {KeyAny} key - key of data
     * @return {Promise<CmdBasicInfoResult>} - info object
     *
     * returns info object {@link CmdBasicInfoResult}
     * */
    getInfo(key: KeyAny): Promise<CmdBasicInfoResult>;
}

export interface CacheBasicSecure<A extends TR, N extends Id> extends ShiftMain<CacheBasic<A, N>> {
    // COPY(source, destination, opt)
    $copy(source: string, destination: string, opt?: CacheOptCopy): Promise<boolean>;

    // GET
    $get(key: string): Promise<string>;

    // MGET
    $getMore(keys: Array<string>): Promise<Array<string>>;

    $exists(keys: string): Promise<boolean>;
    $existMore(keys: Array<string>): Promise<number>;

    $set(key: string, value: string, opt?: CmdBasicSetBase): Promise<string>;
    $setMore(records: Record<string, string>): Promise<string>;

    // DEL(keys)
    $delete(key: string): Promise<boolean>;
    $deleteMore(keys: Array<string>): Promise<number>;

    // UNLINK(keys)
    $unlink(keys: string): Promise<boolean>;
    $unlinkMore(keys: Array<string>): Promise<number>;

    // foreach PTTL
    $getTtl(key: string): Promise<CacheResultGetExpiry>;
    $getTtlMore(keys: Array<string>): Promise<Array<CacheResultGetExpiry>>;

    // foreach PEXPIRETIME(full)
    $getTimestamp(key: string): Promise<CacheResultGetExpiry>;
    $getTimestampMore(keys: Array<string>): Promise<Array<CacheResultGetExpiry>>;

    // foreach PEXPIRE(key, milliseconds, mode)
    $setTtl(key: string, milliseconds: number, mode?: ExpiryMode): Promise<CacheResultSetExpiry>;
    $setTtlMore(key: Array<string>, milliseconds: number, mode?: ExpiryMode): Promise<Array<CacheResultSetExpiry>>;

    // foreach PEXPIREAT(key, milliseconds, mode);
    $setTimestamp(key: string, milliseconds: number, mode?: ExpiryMode): Promise<CacheResultSetExpiry>;
    $setTimestampMore(key: Array<string>, milliseconds: number, mode?: ExpiryMode): Promise<Array<CacheResultSetExpiry>>;

    // foreach PERSIST(full)
    $persist(key: string): Promise<CacheResultPersist>;
    $persistMore(keys: Array<string>): Promise<Array<CacheResultPersist>>;

    // native.TYPE(full)
    $type(key: string): Promise<string>;
    $typeMore(keys: Array<string>): Promise<Array<string>>;
}

export type CacheBasicDef = CacheBasic<TR, Id>;

/**
 * Expire command options
 *
 * @see CacheOptExpiryUnitTuple
 * @see CacheOptExpiryMode
 * */
export type CmdBasicSetTtl = CacheOptExpiryUnitTuple & CacheOptExpiryMode;

/**
 * Expire at command options
 *
 * @see CacheOptExpiryUnitTuple
 * @see CacheOptExpiryMode
 * */
export type CmdBasicSetTimestamp = CacheOptExpiryUnitTuple & CacheOptExpiryMode;


/**
 * Get ttl (remaining time) command options
 *
 * @see CacheOptExpiryUnit
 * */
export type CmdBasicGetTtl = CacheOptExpiryUnit;

/**
 * Get expire time (timestamp) command options
 *
 * @see CacheOptExpiryUnit
 * */
export type CmdBasicGetTimestamp = CacheOptExpiryUnit; // CacheCmdExpireTime


export type CmdBasicInfoResult = CacheResultInfo;

/**
 * Copy key option
 *
 * @see CacheOptCopy
 * */
export type CmdBasicCopy = CacheOptCopy;

export type CmdBasicSetMoreBase = CacheOptSaveSpan &
    CacheOptExpiryUnitTuple;
export type CmdBasicSetMoreWithProp<A> = CmdBasicSetMoreBase &
    CacheOptProperty<A>;


export type CmdBasicSetBase = CacheOptSaveSpan &
    CacheOptSaveMode &
    CacheOptExpiryUnitTuple &
    CacheOptReturnPrevious;

export type CmdBasicSetWithKey<A> = CmdBasicSetBase &
    CacheOptKey &
    CacheOptProperty<A>;

export type CmdBasicSetWithProp<A> = CmdBasicSetBase &
    CacheOptProperty<A>;

export type CmdBasicSetNoKey = CmdBasicSetBase;

export type CacheBasicSimpleCommand<T> = (keys: Array<string>, ...args: Array<unknown>) => Promise<Array<T>>;
export type CacheBasicSimpleNumberCommand = (keys: Array<string>, ...args: Array<unknown>) => Promise<number>;


export type CacheCommandDisabledLambda<A, T> = () => CacheInvalidatorResult<A, T>;
export type CacheCommandIgnoredLambda<A, T> = (error?: string | Error, command?: string) => CacheInvalidatorResult<A, T>;

export type InvalidatorType = 'string'|'number'|'boolean'|'array'|'object';



