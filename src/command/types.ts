import {CacheID} from "../channel";

// region expiry-set
/**
 * Choice expire behaviour during saving
 * */
export interface CacheOptExpirySet {
    /**
     * Expire after now [EX, PX]
     * */
    after: true;

    /**
     * Expire at given timestamp [EXAT, PXAT]
     * */
    timestamp: true;
}
/**
 * Choice expire behaviour during saving, <only one>
 * */
export type CacheOptExpirySetOne = MaximumOneOf<CacheOptExpirySet>;
export type CacheOptExpirySetType = keyof CacheOptExpirySet;
// endregion expiry-set

// region expiry-save
/**
 * Choice expire behaviour during saving
 * */
export interface CacheOptExpirySave extends CacheOptExpirySet {
    /**
     * Keeps TTL (remaining time), it's not changed {KEEPTTL}
     * */
    keepTTL: true;
}
/**
 * Choice expire behaviour during saving, <only one>
 * */
export type CacheOptExpirySaveOne = MaximumOneOf<CacheOptExpirySave>;
export type CacheOptExpirySaveType = keyof CacheOptExpirySave;
// endregion expiry-save

// region expiry-mode
export interface CacheOptExpiryMode {
    /**
     * Set expiry always
     * */
    always: true;

    /**
     * Set expiry only when the key has no expiry
     * */
    whenAbsent: true; // NX

    /**
     * Set expiry only when the key has an existing expiry
     * */
    whenExists: true; // XX

    /**
     * Set expiry only when the new expiry is greater than current one
     * */
    whenGreaterThan: true; // GT

    /**
     * Set expiry only when the new expiry is less than current one
     * */
    whenLessThan: true; // LT
}

export type CacheOptExpiryModeOne = MaximumOneOf<CacheOptExpiryMode>;
export type CacheOptExpiryModeType = keyof CacheOptExpiryMode;
// endregion expiry-mode

// region set-mode
export interface CacheOptSetMode {
    /**
     * Always set
     * */
    always: true;
    /**
     * Only set the key if it does not already exist. [NX]
     * */
    whenAbsent: true;
    /**
     * Only set the key if it already exists. [XX]
     * */
    whenExists: true;
}

export type CacheOptSetModeOne = MaximumOneOf<CacheOptSetMode>;
export type CacheOptSetModeType = keyof CacheOptSetMode;
// endregion set-mode

// region expiry-unit
export interface CacheOptExpiryUnit<T> {
    seconds: T;
    milliseconds: T;
    minutes: T;
}
export type CacheOptExpiryUnitType = keyof CacheOptExpiryUnit<string>;
// endregion expiry-unit

// region expiry-value
export type CacheOptExpiryValue = CacheOptExpiryUnit<number>;
export type CacheOptExpiryValueOne = MaximumOneOf<CacheOptExpiryValue>;
// endregion expiry-value

// region expiry-ttl
export type CacheOptExpiryTtl = CacheOptExpiryUnit<true>;
export type CacheOptExpiryTtlOne = MaximumOneOf<CacheOptExpiryTtl>;
// endregion expiry-ttl

// region set-expiry
/**
 * Expire time settings
 * */
export interface CacheOptSetExpiry {
    /**
     * Expire after now, as seconds
     * */
    afterSec: number; //EX

    /**
     * Expire at given timestamp, as seconds
     * */
    expiresAtSec: number; //EXAT

    /**
     * Expire after now, as milliseconds
     * */
    afterMS: number; //PX

    /**
     * Expire at given timestamp, as milliseconds
     * */
    expiresAtMS: number; //PXAT

    /**
     * Expire after now, as minutes
     * */
    afterMin: number; //EX

    /**
     * Expire at given timestamp, as minutes
     * */
    expiresAtMin: number; //EXAT

    /**
     * Keeps TTL (remaining time), it's not changed
     * */
    keepTtl: true; //KEEPTTL
}
export type CacheOptSetExpiryOne = MaximumOneOf<CacheOptSetExpiry>;
// endregion set-expiry

// region key
export interface CacheOptKey {
    key: CacheID;
}

export type CacheOptKeyOne = MaximumOneOf<CacheOptKey>;
// endregion key

// region return
export interface CacheOptSetReturn {
    /**
     * Return the old string stored at key, or null if key did not exist.
     * An error is returned and SET aborted if the value stored at key is not a string
     * */
    returnPrevious?: true;
}
// endregion return



// region increment-data

/**
 * Increment data type options
 * */
export interface CacheOptIncData {
    /**
     * Integer type, if it's double than it will be floored
     * */
    integer: true;

    /**
     * Double type
     * */
    float: true;
}
/**
 * Increment data type options for only one
 *
 * @see CacheOptIncDir
 * */
export type CacheOptIncDataOne = MaximumOneOf<CacheOptIncData>;
export type CacheOptIncDataType = keyof CacheOptIncData;
// endregion increment-data


// region increment-direction
/**
 * Increment direction options
 * */
export interface CacheOptIncDir {
    /**
     * incremented value
     * */
    increment: number;
    /**
     * decremented value
     * */
    decrement: number;
}

/**
 * Increment direction options for only one
 *
 * @see CacheOptIncDir
 * */
export type CacheOptIncDirOne = MaximumOneOf<CacheOptIncDir>;
export type CacheOptIncDirType = keyof CacheOptIncDir;
// endregion increment-direction

export interface CacheExpireResult {
    unit: CacheOptExpiryUnitType;
    value: number;
}

// region commands
/**
 * Expire command options
 *
 * @see CacheOptExpiryValueOne
 * @see CacheOptExpiryModeOne
 * */
export type CacheCmdExpire = CacheOptExpiryValueOne & CacheOptExpiryModeOne;
/**
 * Expire at command options
 *
 * @see CacheOptExpiryValueOne
 * @see CacheOptExpiryModeOne
 * */
export type CacheCmdExpireAt = CacheOptExpiryValueOne & CacheOptExpiryModeOne;
/**
 * Get ttl command options
 *
 * @see CacheOptExpiryTtlOne
 * */
export type CacheCmdTtl = CacheOptExpiryTtlOne;

/**
 * Increment options with data type and direction
 *
 * @see CacheOptIncDataOne
 * @see CacheOptIncDirOne
 * */
export type CacheCmdInc = CacheOptIncDataOne & CacheOptIncDirOne;


/**
 * Copy key option
 * */
export interface CacheCmdCopy {
    /**
     * Destination database index
     * */
    destinationDb?: number;

    /**
     * Removes the destination key before copying the value to it
     * */
    replace?: boolean;
}

export type CacheCmdSet = CacheOptKeyOne & CacheOptSetModeOne & CacheOptSetExpiryOne & CacheOptSetReturn;

// endregion commands

// region utility
// todo add to leyyo
export type MaximumOneOf<T, K extends keyof T = keyof T> = K extends keyof T ? {
    [P in K]?: T[K];
} & Partial<Record<Exclude<keyof T, K>, never>> : never;
// endregion utility
