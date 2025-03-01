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
    CacheOptSaveSpan,
    CacheResultInfo
} from "../command";
import {Id, KeyAny, KeyAnyArray, KeyId, TR} from "../types";
import {ShiftMain, ShiftSecureFlat} from "../secure";

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
    getDoc(key: KeyAny): Promise<A>;

    /**
     * Get the value of key
     *
     * @param {KeyAny} key - key of data
     * @return {Promise<Object>} - Parsed value of key
     *
     * Notes:
     * - An error is returned if the value stored at key is not a string, because GET only handles string values.
     * */
    getRaw<T>(key: KeyAny): Promise<T>;

    /**
     * Returns the values of all specified keys. (from json)
     *
     * @param {KeyAnyArray} keys - keys of data
     * @return {Promise<Record<KeyId, Object>>} - a record of values at the specified keys
     *
     * Notes:
     * - Value is parsed from json
     * */
    listDocs(keys: KeyAnyArray): Promise<Record<KeyId, Partial<A>>>;

    /**
     * Returns the values of all specified keys.
     *
     * @param {KeyAnyArray} keys - keys of data
     * @return {Promise<Record<KeyId, Object>>} - a record of values at the specified keys
     * */
    listRaws<T>(keys: KeyAnyArray): Promise<Record<KeyId, T>>;

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
    setRaw<T>(key: KeyAny, value: T, opt?: CmdBasicSetBase): Promise<CacheInvalidatorResult<A, T | boolean>>;

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
    setRawsMore<T>(records: Record<KeyId, T>, opt?: CmdBasicSetNoKey): Promise<CacheInvalidatorResult<A, boolean>>;

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
    setRawsMore<T>(map: Map<KeyId, T>, opt?: CmdBasicSetNoKey): Promise<CacheInvalidatorResult<A, boolean>>;

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
    setRawsMore<T>(tuples: Array<[KeyId, T]>, opt?: CmdBasicSetNoKey): Promise<CacheInvalidatorResult<A, boolean>>;

    /**
     * Returns if key exists
     *
     * @param {KeyAny} key - key of data
     * @return {Promise<boolean>} - does the key exists?
     * */
    exists(key: KeyAny): Promise<boolean>;

    /**
     * Returns if keys exist
     *
     * @param {KeyAnyArray} keys - keys of data
     * @return {Promise<number>} - the number of keys that exist
     * */
    existMore(keys: KeyAnyArray): Promise<number>;

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
    setTtl(key: KeyAny, opt?: CmdBasicSetTtl): Promise<boolean>;

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
    setTimestamp(key: KeyAny, opt?: CmdBasicSetTimestamp): Promise<boolean>;

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
    getTimestamp(key: KeyAny, opt?: CmdBasicGetTimestamp): Promise<number>;

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
    getTtl(key: KeyAny, opt?: CmdBasicGetTtl): Promise<number>;

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
    persist(key: KeyAny): Promise<boolean>;

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
    copy(source: KeyAny, destination: KeyAny, opt?: CmdBasicCopy): Promise<boolean>;

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
    getType(key: KeyAny): Promise<string>;

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
    $get(key: string): Promise<string>;
    $list(keys: Array<string>): Promise<Array<string>>;
    $exists(keys: Array<string>): Promise<number>;

    $set(key: string, value: string): Promise<boolean>;
    $setMore(rec: Record<string, string>): Promise<boolean>;

    $delete(keys: Array<string>): Promise<number>;
    $unlink(keys: Array<string>): Promise<number>;

    $getTtl(key: KeyAny, opt?: CmdBasicGetTtl): Promise<number>;
    $setTtl(key: KeyAny, opt?: CmdBasicSetTtl): Promise<boolean>;

    $setTimestamp(key: KeyAny, opt?: CmdBasicSetTimestamp): Promise<boolean>;
    $setTimestamp(key: KeyAny, opt?: CmdBasicSetTimestamp): Promise<boolean>;

    $persist(keys: Array<string>): Promise<Array<boolean>>;

    $getType(key: string): Promise<string>;
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



