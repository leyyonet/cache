import {CacheID, CacheKey, TR} from "../channel";
import {CacheInvalidator} from "../invalidator";
import {CacheCmdCopy, CacheCmdExpire, CacheCmdExpireAt, CacheCmdSet, CacheCmdTtl} from "../command";
import {CachePropGlobal} from "../prop";

export interface CacheBasic<A extends TR, N extends CacheID, C> {

    // region get
    /**
     * Get the value of key
     *
     * @param {CacheKey<Object>} key - key of data
     * @return {Promise<Object>} - Parsed value of key
     *
     * Notes:
     * - An error is returned if the value stored at key is not a string, because GET only handles string values.
     * */
    get(key: CacheKey<A>): Promise<A>;

    /**
     * Returns the values of all specified keys.
     * For every key that does not hold a string value or does not exist, the special value nil is returned.
     * Because of this, the operation never fails.
     *
     * @param {Array<CacheKey<Object>>} keys - keys of data
     * @return {Promise<Record<CacheID, Object>>} - a record of values at the specified keys
     * */
    getMore(keys: Array<CacheKey<A>>): Promise<Record<CacheID, A>>;
    // endregion get

    // region set
    /**
     * Sets value with given key in parameters
     *
     * @param {CacheKey<Object>} key - key of data
     * @param {Object} value - data
     * @param {CacheCmdSet?} opt - options
     * @return {Promise<Object|boolean>} - previous data or is success?
     *
     * Notes
     * - If key already holds a value, it is overwritten, regardless of its type.
     * - Any previous time to live associated with the key is discarded on successful SET operation.
     *
     * option key
     * - if {opt.key: string} => key is used, otherwise key can be picked in object via property: {@link CacheOptKeyOne#key}, {@link CachePropGlobal#property}
     *
     * option expiry <one of them>
     * - if {opt.afterSec: number}      => seconds as ttl: {@link CacheOptSetExpiry#afterSec}
     * - if {opt.expiresAtSec: number} => seconds as timestamp, def: {@link CacheOptSetExpiry#expiresAtSec}
     * - if {opt.afterMS: number}      => milliseconds as ttl: {@link CacheOptSetExpiry#afterMS}
     * - if {opt.expiresAtMS: number} => milliseconds as timestamp, def: {@link CacheOptSetExpiry#expiresAtMS}
     * - if {opt.afterMin: number}      => minutes as ttl: {@link CacheOptSetExpiry#afterMin}
     * - if {opt.expiresAtMin: number} => minutes as timestamp, def: {@link CacheOptSetExpiry#expiresAtMin}
     * - if {opt.keepTtl: true}        => Keeps TTL, it's not changed: {@link CacheOptSetExpiry#keepTtl}
     * - Default[if absent]            => {@link CachePropGlobal#expiryUnit}
     * - Default[if non-positive]      => {@link CachePropGlobal#expiryValue}
     *
     * option mode <one of them>
     * - if {opt.always: true}          => always: {@link CacheOptExpiryMode#always}
     * - if {opt.whenAbsent: true}      => Only set the key if it does not already exist: {@link CacheOptSetMode#whenAbsent}
     * - if {opt.whenExists: true}      => Only set the key if it already exists: {@link CacheOptSetMode#whenExists}
     * - Default[if absent]             => {@link CachePropGlobal#setMode}
     *
     * option return
     * - if {opt.returnPrevious: true} => return previous data: {@link CacheOptSetReturn#returnPrevious}
     *
     * returns <one of them>
     * - Object => previous data of key, {@link CacheOptSetReturn#returnPrevious}
     * - false  => the key was not set
     * - true   => the key was set
     * */
    set(key: CacheKey<A>, value: A, opt: Omit<CacheCmdSet, 'key'>): Promise<CacheInvalidator<A, N, C, A|boolean>>;
    /**
     * Sets value without given key in parameters
     *
     * @param {Object} value - data
     * @param {CacheCmdSet?} opt - options
     * @return {Promise<Object|boolean>} - previous data or is success?
     *
     * @inheritDoc
     * */
    set(value: A, opt: CacheCmdSet): Promise<CacheInvalidator<A, N, C, A|boolean>>;

    /**
     * Sets multiple keys with given record of values
     *
     * @param {Record<CacheID, Object>} values - record of values
     * @return {Promise<boolean>} - is success?
     * */
    setMore(values: Record<CacheID, A>): Promise<CacheInvalidator<A, N, C, boolean>>;

    /**
     * Sets multiple keys with given array of values
     *
     * @param {Array<Object>} values - array of values
     * @return {Promise<boolean>} - is success?
     * */
    setMore(values: Array<A>): Promise<CacheInvalidator<A, N, C, boolean>>;
    // endregion set

    // region exists
    /**
     * Returns if keys exist
     *
     * @param {Array<CacheKey<Object>>} keys - keys of data
     * @return {Promise<number>} - the number of keys that exist
     * */
    existsMore(keys: Array<CacheKey<A>>): Promise<number>;

    /**
     * Returns if key exists
     *
     * @param {CacheKey<Object>} key - key of data
     * @return {Promise<boolean>} - does the key exists?
     * */
    exists(key: CacheKey<A>): Promise<boolean>;
    // endregion exists

    // region delete
    /**
     * Removes the specified keys. A key is ignored if it does not exist.
     *
     * @param {Array<CacheKey<Object>>} keys - keys of data
     * @return {Promise<number>} - the number of keys that were removed
     * */
    deleteMore(keys: Array<CacheKey<A>>): Promise<CacheInvalidator<A, N, C, number>>;

    /**
     * Removes the specified key. A key is ignored if it does not exist.
     *
     * @param {CacheKey<Object>} key - key of data
     * @return {Promise<number>} - the number of keys that were removed
     *
     * returns <one of them>
     * - 0 => key does not exist
     * - 1  => key was removed
     * */
    delete(key: CacheKey<A>): Promise<CacheInvalidator<A, N, C, number>>;

    /**
     * Removes the specified keys without blocking. A key is ignored if it does not exist.
     *
     * @param {Array<CacheKey<Object>>} keys - keys of data
     * @return {Promise<number>} - the number of keys that were removed
     *
     * Notes
     * - The actual removal will happen later asynchronously
     * */
    unlinkMore(keys: Array<CacheKey<A>>): Promise<CacheInvalidator<A, N, C, number>>;

    /**
     * Removes the specified key without blocking. A key is ignored if it does not exist.
     *
     * @param {CacheKey<Object>} key - key of data
     * @return {Promise<number>} - the number of keys that were removed
     *
     * returns <one of them>
     * - 0 => key does not exist
     * - 1  => key was removed
     *
     * Notes
     * - The actual removal will happen later asynchronously
     * */
    unlink(key: CacheKey<A>): Promise<CacheInvalidator<A, N, C, number>>;
    // endregion delete

    // region expire
    /**
     * Sets a timeout on key after now.
     * After the timeout has expired, the key will automatically be deleted.
     *
     * @param {CacheKey<Object>} key - key of data
     * @param {CacheCmdExpire?} opt - options
     * @return {Promise<boolean>} - is success?
     *
     * after now value <one of them>
     * - if {opt.seconds: number}      => as seconds after now: {@link CacheOptExpiryValueOne#seconds}
     * - if {opt.milliseconds: number} => as milliseconds after now, def: {@link CacheOptExpiryValueOne#milliseconds}
     * - if {opt.minutes: number}      => as minutes after now: {@link CacheOptExpiryValueOne#minutes}
     * - Default[if absent]            => {@link CachePropGlobal#expiryUnit}
     * - Default[if non-positive]      => {@link CachePropGlobal#expiryValue}
     *
     * mode <one of them>
     * - if {opt.always: true}          => always: {@link CacheOptExpiryMode#always}
     * - if {opt.whenAbsent: true}      => the key has no expiry: {@link CacheOptExpiryMode#whenAbsent}
     * - if {opt.whenExists: true}      => the key has an existing expiry: {@link CacheOptExpiryMode#whenExists}
     * - if {opt.whenGreaterThan: true} => the new expiry is greater than current one: {@link CacheOptExpiryMode#whenGreaterThan}
     * - if {opt.whenLessThan: true}    => the new expiry is less than current one: {@link CacheOptExpiryMode#whenLessThan}
     * - Default[if absent]             => {@link CachePropGlobal#expiryMode}
     *
     * returns <one of them>
     * - false => key does not exist
     * - true  => the timeout was set
     *
     * */
    expire(key: CacheKey<A>, opt?: CacheCmdExpire): Promise<boolean>;

    /**
     * Sets a timeout on key with specific timestamp.
     * After the timeout has expired, the key will automatically be deleted.
     *
     * @param {CacheKey<Object>} key - key of data
     * @param {CacheCmdExpire?} opt - options
     * @return {Promise<boolean>} - is success?
     *
     * timestamp <one of them>
     * - if {opt.seconds: number}      => as seconds as timestamp: {@link CacheOptExpiryValueOne#seconds}
     * - if {opt.milliseconds: number} => as milliseconds as timestamp, def: {@link CacheOptExpiryValueOne#milliseconds}
     * - if {opt.minutes: number}      => as minutes as timestamp: {@link CacheOptExpiryValueOne#minutes}
     * - Default[if absent]            => {@link CachePropGlobal#expiryUnit}
     * - Default[if non-positive]      => now + {@link CachePropGlobal#expiryValue}
     *
     * mode <one of them>
     * - if {opt.always: true}          => always: {@link CacheOptExpiryMode#always}
     * - if {opt.whenAbsent: true}      => the key has no expiry: {@link CacheOptExpiryMode#whenAbsent}
     * - if {opt.whenExists: true}      => the key has an existing expiry: {@link CacheOptExpiryMode#whenExists}
     * - if {opt.whenGreaterThan: true} => the new expiry is greater than current one: {@link CacheOptExpiryMode#whenGreaterThan}
     * - if {opt.whenLessThan: true}    => the new expiry is less than current one: {@link CacheOptExpiryMode#whenLessThan}
     * - Default[if absent]             => {@link CachePropGlobal#expiryMode}
     *
     * returns <one of them>
     * - false => key does not exist
     * - true  => the timeout was set
     *
     * */
    expireAt(key: CacheKey<A>, opt?: CacheCmdExpireAt): Promise<boolean>;

    /**
     * Returns the absolute Unix timestamp (since January 1, 1970) at which the given key will expire
     *
     * @param {CacheKey<Object>} key - key of data
     * @param {CacheCmdTtl?} opt - options
     * @return {Promise<number>} - return remaining time based on option
     *
     * returns <one of them>
     * - (-1)                      => the key exists but has no associated expiration time.
     * - (-2)                      => the key does not exist.
     * - seconds as timestamp      => {opt.seconds: true}, {@link CacheOptExpiryTtlOne#seconds}
     * - milliseconds as timestamp => {opt.milliseconds: true}, {@link CacheOptExpiryTtlOne#milliseconds}
     * - minutes as timestamp      => {opt.minutes: true}, {@link CacheOptExpiryTtlOne#minutes}
     * - Default[if absent]        => {@link CachePropGlobal#expiryUnit}
     *
     * */
    expireTime(key: CacheKey<A>, opt?: CacheCmdTtl): Promise<number>;
    /**
     * Returns the remaining time to live of a key that has a timeout.
     *
     * @param {CacheKey<Object>} key - key of data
     * @param {CacheCmdTtl?} opt - options
     * @return {Promise<number>} - return remaining time based on option
     *
     * returns <one of them>
     * - (-1)                => the key exists but has no associated expiration time.
     * - (-2)                => the key does not exist.
     * - seconds as TTL      => {opt.seconds: true}, {@link CacheOptExpiryTtlOne#seconds}
     * - milliseconds as TTL => {opt.milliseconds: true}, {@link CacheOptExpiryTtlOne#milliseconds}
     * - minutes as TTL      => {opt.minutes: true}, {@link CacheOptExpiryTtlOne#minutes}
     * - Default[if absent]  => {@link CachePropGlobal#expiryUnit}
     *
     * */
    ttl(key: CacheKey<A>, opt?: CacheCmdTtl): Promise<number>;

    /**
     * Removes the existing timeout on key
     *
     * @param {CacheKey<Object>} key - key of data
     * @return {Promise<boolean>} - is success?
     *
     * returns <one of them>
     * - false => key does not exist or does not have an associated timeout.
     * - true  => the timeout has been removed.
     * */
    persist(key: CacheKey<A>): Promise<boolean>;
    // endregion expire

    // region other
    /**
     * Copies the value stored at the source key to the destination key
     *
     * @param {CacheKey<Object>} source - source key
     * @param {CacheKey<Object>} destination - destination key
     * @param {CacheCmdCopy?} opt - options
     * @return {Promise<boolean>} - is success?
     *
     * options
     * - Logical database index, {@link CacheCmdCopy#destinationDb}
     * - It replace if exists, {@link CacheCmdCopy#replace}
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
    copy(source: CacheKey<A>, destination: CacheKey<A>, opt?: CacheCmdCopy): Promise<boolean>;

    /**
     * Returns the string representation of the type of the value stored at key
     *
     * @param {CacheKey<Object>} key - key of data
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
    type(key: CacheKey<A>): Promise<string>;
    // endregion other

}
export interface SetPropertyOpt<T> {
    property?: keyof T;
}