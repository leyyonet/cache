import {CacheExpireResult, CacheOptExpiryTtlOne, CacheOptExpiryUnitType, CacheOptExpiryValueOne} from "../command";
import {CacheID} from "../channel";

export interface CacheUtil {
    utcSec(seconds: number): number;
    utcMs(milliseconds: number): number;
    parseOne<T>(value: unknown): T;
    parseArray<T>(value: Array<unknown>): Array<T>;
    parseObject<T>(value: Record<string, unknown>): Record<string, T>;
    jsonOne(value: unknown): string;
    jsonArray(value: Array<unknown>): Array<string>;
    jsonObject(value: Record<string, unknown>): Record<string, string>;
    asArray<T>(value: Array<T>): Array<T>;
    asKey(value: unknown): string;
    asKeys(values: unknown): Array<string>;
    asObject<T>(value: Record<string, T>|Object|Map<string, T>|Array<[string, T]>): Record<string, T>;
    objectFromKeys<T>(keys: Array<CacheID>, def?: T, values?: Array<T>): Record<string, T>;

    getExpireRec(opt: CacheOptExpiryValueOne, def: CacheOptExpiryUnitType, fn: CacheUtilExpireTimeLambda): CacheExpireResult;
    getExpireAtRec(opt: CacheOptExpiryValueOne, def: CacheOptExpiryUnitType, fn: CacheUtilExpireTimeLambda): CacheExpireResult;
    getExpireUnit(opt: CacheOptExpiryTtlOne, def: CacheOptExpiryUnitType): CacheOptExpiryUnitType;
}

export type CacheUtilExpireTimeLambda = (unit: CacheOptExpiryUnitType) => number;