import {ExpiryMode, ExpiryUnit, SaveMode, SaveSpan} from "../literal";
import {KeyAny, OneOrMore, TR} from "../types";

export type DIS = -99;
export type EKEY = -98;
export type EVAL = -97;

/**
 * {@link DIS} - Disabled
 * {@link EKEY} - Empty key/keys
 * {@code 0} False, no
 * {@code 1} True, yes
 * */
export type CacheResultBoolean = DIS | EKEY | EVAL | 0 | 1;

/**
 * {@link DIS} - Disabled
 * {@link EKEY} - Empty key/keys
 * {@code number} count ie: existed count, deleted count, affected count, length, size etc
 * */
export type CacheResultNumber = DIS | EKEY | EVAL | number;

/**
 * {@link DIS} - Disabled
 * {@link EKEY} - Empty key/keys
 * {@code -2} key does not exist.
 * {@code -1} key exists but has no associated expire.
 * {@code number} TTL or timestamp
 * */
export type CacheResultGetExpiry = DIS | EKEY | -1 | -2 | number;

/**
 * {@link DIS} - Disabled
 * {@link EKEY} - Empty key/keys
 * {@link EVAL} - Invalid time value
 * {@code -2} no such field exists in the provided hash key, or the provided key does not exist.
 * {@code 0} the specified NX | XX | GT | LT condition has not been met.
 * {@code 1} the expiration time was set/updated.
 * {@code 2} when HEXPIRE/HPEXPIRE is called with 0 seconds/milliseconds or when HEXPIREAT/HPEXPIREAT is called with a past Unix time in seconds/milliseconds.
 * */
export type CacheResultSetExpiry = DIS | EKEY | EVAL | -2 | 0 | 1 | 2;

/**
 * {@link DIS} - Disabled
 * {@link EKEY} - Empty key/keys
 * {@code -2} if no such field exists in the provided hash key, or the provided key does not exist.
 * {@code -1} if the field exists but has no associated expiration set.
 * {@code 1} the expiration was removed.
 * */
export type CacheResultPersist = DIS | EKEY | -2 | -1 | 1;

/**
 * {@link DIS} - Disabled
 * {@link EKEY} - Empty key/keys
 * {@link EVAL} - Empty value/values
 * {@code 0} - Not set
 * {@code 1} - set
 * */
export type CacheResulSet = DIS | EKEY | EVAL | 0 | 1;

/**
 * {@link DIS} - Disabled
 * {@link EKEY} - Empty source
 * {@link EVAL} - Empty destination
 * {@code 0} - Not copied
 * {@code 1} - Copied
 * */
export type CacheResulCopy = DIS | EKEY | EVAL | 0 | 1;

// region parts
/**
 * Cache key options when key can not be provided
 *
 * if {opt.key: string} => key is used, otherwise key can be picked in object via property: {@link CacheOptProperty}
 *
 * */
export interface CacheOptKey {
    key?: KeyAny;
}

/**
 * Cache property of data options when channel uses different property
 *
 * If key is empty then this values is used to grab key value from document, ie: doc>code, doc>country etc.
 * - `filled`  => key is generated from `doc.{property}`
 * - Default   => {@link CacheSegmentProp#property}
 *
 * */
export interface CacheOptProperty<A extends TR = TR> {
    property?: OneOrMore<keyof A>;
}


export type CacheExpiryUnitTuple = [number, ExpiryUnit?];

/**
 * Time unit option
 *
 * Cases:
 * 1 - for getting ttl, remaining time
 * Changes result timestamp span
 * - `seconds`      => return remaining seconds
 * - `milliseconds` => return remaining milliseconds
 * - `minutes`      => return remaining minutes
 *
 * 2- for getting timestamp or exact expire time
 * Changes result timestamp span
 * - `seconds`      => return timestamp as seconds
 * - `milliseconds` => return timestamp as milliseconds
 * - `minutes`      => return timestamp as minutes
 *
 * - Default        => {@link CachePropData#expiryUnit}
 * */
export interface CacheOptExpiryUnit {
    unit?: ExpiryUnit;
}

/**
 * Changes expire time span, it 2-length tuple as [600, 'seconds']
 *
 * Cases:
 *
 * 1 - for setting ttl, remaining time
 * Changes expire time span, it 2-length tuple as [600, 'seconds']
 * - 0 => positive time value, if it's empty, negative,... then default is used from {@link CacheSegmentProp#milliseconds}
 * - 1 => time unit as {@link ExpiryUnit}, if it's empty then default is used from {@link CacheSegmentProp#expiryUnit}
 * - .... `seconds`      => remaining seconds {@link CmdBasicSetWithKey#span}
 * - .... `milliseconds` => remaining milliseconds {@link CmdBasicSetWithKey#span}
 * - .... `minutes`      => remaining minutes {@link CmdBasicSetWithKey#span}
 *
 * 2 - for setting timestamp or exact expire time
 * - 0 => positive time value, if it's empty, negative,... then default is used from {@link CacheSegmentProp#milliseconds}
 * - 1 => time unit as {@link ExpiryUnit}, if it's empty then default is used from {@link CacheSegmentProp#expiryUnit}
 * - .... `seconds`      => seconds as timestamp
 * - .... `milliseconds` => milliseconds as timestamp
 * - .... `minutes`      => minutes as timestamp
 *
 * 3 - for saving, timestamp and ttl option is known via {@link CacheOptSaveSpan}
 *
 * */
export interface CacheOptExpiryUnitTuple {
    expiry?: CacheExpiryUnitTuple;
}

/**
 * Changes changing expire time strategy
 * - `always`  => always
 * - `absent`  => When the key has no expiry
 * - `exists`  => When the key has an existing expiry
 * - `greater` => When the new expiry is greater than current one
 * - `less`    => When the new expiry is less than current one
 *
 * - Default   => {@link CacheSegmentProp#expiryMode}
 * */
export interface CacheOptExpiryMode {
    mode?: ExpiryMode;
}

/**
 *
 * Changes saving strategy
 * - `always` => always
 * - `absent` => When the key does not already exist
 * - `exists` => When the key already exists
 * - Default  => {@link CacheSegmentProp#saveMode}
 *
 * */
export interface CacheOptSaveMode {
    mode?: SaveMode;
}

/**
 *
 * Changes expire time span
 * - `ttl`        => time value is evaluated as ttl, so expired at will be now + value
 * - `timestamp`  => time value is evaluated as timestamp (exact time)
 * - `keep-ttl`   => keeps TTL (remaining time) of key (if exists), it's not changed
 * - `persistent` => Removes TTL and set it as persistent
 *
 * Notes:
 * - Time value is coming from {@link CacheOptExpiryUnitTuple}
 * - for `keep-ttl`and `persistent` cases, time will not be used
 *
 * */
export interface CacheOptSaveSpan {
    span?: SaveSpan;
}

export interface CacheOptReturnPrevious {
    /**
     * Return the old string stored at key, or null if key did not exist.
     * An error is returned and SET aborted if the value stored at key is not a string
     * */
    returnPrevious?: true;
}

export interface CacheOptCopy {
    /**
     * Destination database index
     * */
    destinationDb?: number;

    /**
     * Removes the destination key before copying the value to it
     * */
    replace?: boolean;
}

export interface CacheResultInfo {
    /**
     * Full path of key
     * */
    full: string;
    /**
     * The key exists or not
     * */
    exists: boolean;
    /**
     * Type of key
     * */
    type: string;
    /**
     * Ttl of key as milliseconds
     * */
    ttl: number;

    /**
     * Value of key, for hash: [field, value], for set: members
     * */
    value: unknown;
}


// endregion parts


/*
*
* // @leyyo add
export type MaximumOneOf<T, K extends keyof T = keyof T> = K extends keyof T ? {
    [P in K]: T[K];
} & Partial<Record<Exclude<keyof T, K>, never>> : never;


type ValueOf<Obj> = Obj[keyof Obj];
type OneOnly<Obj, Key extends keyof Obj> = Omit<Obj, Exclude<keyof Obj, Key>> | Pick<Obj, Key>;
type OneOfByKey<Obj> = { [key in keyof Obj]: OneOnly<Obj, key> };
export type OneOf<Obj> = ValueOf<OneOfByKey<Obj>>;

export type Xor<a, b> =
    | XorIn<a & { [k in keyof b]?: undefined }>
    | XorIn<b & { [k in keyof a]?: undefined }>;
type XorIn<t> = { [k in keyof t]: t[k] } & unknown;

type Values<V> = V[keyof V];

type ObjectToAnyPair<V> = Values<{ [K in keyof V]: { [K1 in K]: V[K1] } }>

* */

