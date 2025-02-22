import {CacheUtil, CacheUtilExpireTimeLambda} from "./types";
import {
    CacheExpireResult,
    CacheOptExpiryTtl,
    CacheOptExpiryTtlOne,
    CacheOptExpiryUnitType,
    CacheOptExpiryValueOne
} from "../command";

class CacheUtilImpl implements CacheUtil {
    utcSec(seconds: number): number {
        return Math.floor(new Date().getTime()/1000) + seconds;
    }
    utcMs(milliseconds: number): number {
        return new Date().getTime() + milliseconds;
    }
    parseOne<T>(value: unknown): T {
        if (value === undefined || value === null) {
            return null;
        }
        if (typeof value === 'string') {
            return JSON.parse(value) as T;
        }
        return value as T;
    }
    parseArray<T>(value: Array<unknown>): Array<T> {
        return this.asArray(value).map((v: string) => this.parseOne(v));
    }
    parseObject<T>(value: Record<string, unknown>): Record<string, T> {
        const entries = Object.entries(this.asObject(value));
        if (entries.length < 1) {
            return {};
        }
        const parsed = {};
        for (const [k, v] of entries) {
            parsed[k] = this.parseOne(v);
        }
        return parsed;
    }
    jsonOne(value: unknown): string {
        if (value === undefined || value === null) {
            return null;
        }
        return JSON.stringify(value);
    }
    jsonArray(value: Array<unknown>): Array<string> {
        return this.asArray(value).map((v: string) => this.jsonOne(v));
    }
    jsonObject(value: Record<string, unknown>): Record<string, string> {
        const entries = Object.entries(this.asObject(value));
        if (entries.length < 1) {
            return {};
        }
        const parsed = {};
        for (const [k, v] of entries) {
            parsed[k] = this.jsonOne(v);
        }
        return parsed;
    }
    asArray<T>(value: Array<T>): Array<T> {
        if (value === undefined || value === null || !Array.isArray(value) || value.length < 1) {
            return [];
        }
        return value;
    }
    asKey(value: unknown): string {
        if (value === undefined || value == null) {
            return null;
        }
        switch (typeof value) {
            case "string":
                const str = value.trim();
                return str !== '' ? str : null;
            case "number":
            case "bigint":
                return String(value);
            case "boolean":
                return value ? 'true' : 'false';
            default:
                return null;
        }
    }
    asKeys(values: unknown): Array<string> {
        if (values === undefined || values == null) {
            return null;
        }
        let arr: Array<string>;
        if (Array.isArray(values)) {
            arr = values.map(m => this.asKey(m)).filter(f => f !== null);
        }
        else {
            arr = [this.asKey(values)].filter(f => f !== null);
        }
        return arr.length > 0 ? arr : null;
    }
    private _asObject<T>(value: Record<string, T>): Record<string, T> {
        const obj = {};
        for (const [k, v] of Object.entries(value)) {
            if (typeof k === 'string' && !['symbol', 'function', 'undefined'].includes(typeof v)) {
                obj[k] = v;
            }
        }
        return obj;
    }
    asObject<T>(value: Record<string, T>|Object|Map<string, T>|Array<[string, T]>): Record<string, T> {
        if (value === undefined || value === null || typeof value !== 'object') {
            return {};
        }
        if (value instanceof Map) {
            return this._asObject(Object.fromEntries(value.entries()));
        }
        else if (Array.isArray(value)) {
            const arr = value as Array<unknown>;
            // todo move to leyyo, as isTuple
            let isTuple = true;
            for (const item of arr) {
                if (!Array.isArray(item) || item.length !== 2) {
                    isTuple = false;
                    break;
                }
            }
            if (isTuple) {
                try {
                    return this._asObject(Object.fromEntries(value));
                } catch (e) {
                    // for any invalid key case
                    const obj = {} as Record<string, T>;
                    let key: string;
                    arr.forEach(item => {
                        key = this.asKey(item[0]);
                        if (key !== null) {
                            obj[key] = item[1] as T;
                        }
                    });
                    return this._asObject(obj);
                }
            }
            // not tuple, completely flat array
            const obj = {} as Record<string, T>;
            let key: string;
            arr.forEach((item, i) => {
                if (i % 2 === 0) {
                    key = this.asKey(item);
                }
                else if (key !== null) {
                    obj[key] = item as T;
                }
            });
            return this._asObject(obj);
        }
        return this._asObject(value as Record<string, T>);
    }
    objectFromKeys<T>(keys: Array<string>, def?: T, values?: Array<T>): Record<string, T> {
        if (def === undefined) {
            def = null;
        }
        const obj = {};
        values = this.asArray(values);
        if (values.length > 0) {
            keys.forEach((k, i) => {
                if (values[i] !== undefined) {
                    obj[k] = values[i];
                }
                else {
                    obj[k] = def;
                }
            });
        }
        else {
            keys.forEach(k => {
                obj[k] = def;
            });
        }
        return obj;
    }

    getExpireRec(opt: CacheOptExpiryValueOne, def: CacheOptExpiryUnitType, fn: CacheUtilExpireTimeLambda): CacheExpireResult {
        const o2 = opt as CacheOptExpiryValueOne;
        let value: number;
        let unit: CacheOptExpiryUnitType;
        if (o2.seconds !== undefined) {
            value = o2.seconds;
            unit = 'seconds';
        }
        else if (o2.milliseconds !== undefined) {
            value = o2.milliseconds;
            unit = 'milliseconds';
        }
        else if (o2.minutes !== undefined) {
            value = o2.minutes;
            unit = 'minutes';
        }
        else {
            unit = def;
        }
        if (value < 1) {
            value = fn(unit);
        }
        return {value, unit};
    }
    getExpireAtRec(opt: CacheOptExpiryValueOne, def: CacheOptExpiryUnitType, fn: CacheUtilExpireTimeLambda): CacheExpireResult {
        const {value, unit} = this.getExpireRec(opt, def, fn);
        if (value > 0) {
            const time = new Date().getTime();
            switch (unit) {
                case "seconds":
                    return {value: value + Math.floor(time / 1_000), unit};
                case "milliseconds":
                    return {value, unit};
                case "minutes":
                    return {value: value + Math.floor(time / 60_000), unit};
            }
        }
        return {value, unit};
    }
    getExpireUnit(opt: CacheOptExpiryTtlOne, def: CacheOptExpiryUnitType): CacheOptExpiryUnitType {
        const o2 = opt as CacheOptExpiryTtl;
        if (o2.seconds) {
            return 'seconds';
        }
        else if (o2.milliseconds !== undefined) {
            return 'milliseconds';
        }
        else if (o2.minutes !== undefined) {
            return 'minutes';
        }
        else if (def) {
            return def;
        }
        return 'seconds';
    }


}
export const cacheUtil:CacheUtil = new CacheUtilImpl();