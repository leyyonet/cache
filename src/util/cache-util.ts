import {CacheUtil} from "./types";
import {BuilderAny} from "@leyyo/builder";

class CacheUtilImpl implements CacheUtil {
    protected readonly chars = ['|', '/', '>', ':'];
    private _converted: Record<string, string> = {};
    private _same: Array<string> = [];

    constructor() {
        setTimeout(() => this._clear(), 5 * 60_000); // 5 minutes
    }

    private _clear() {
        this._converted = {};
        this._same = [];
        setTimeout(() => this._clear(), 5 * 60_000); // 5 minutes
    }

    alphaNumeric(value: string): string {
        if (!value) {
            return value;
        }

        if (this._same.includes(value)) {
            return value;
        }

        if (!/[|\/^>:]/.test(value)) {
            this._same.push(value);
            return value;
        }

        if (this._converted[value]) {
            return this._converted[value];
        }
        let text = value;
        if (text.includes('^')) {
            text = text.replace('^', '~#£');
        }
        this.chars.forEach((c, i) => {
            if (text.includes(c)) {
                text = text.replace(c, '^' + i);
            }
        });
        this._converted[value] = text;
        return text;
    }

    bindAll(instance: Object): void {
        // @leyyo
        // Get all defined class methods
        const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(instance));
        const arr = [];
        // Bind all methods
        methods
            .filter(method => (method !== 'constructor'))
            .forEach((method) => {
                instance[method] = instance[method].bind(instance);
                arr.push(method);
            });
        for (const [method, body] of Object.entries(instance)) {
            if (typeof body === 'function' && !arr.includes(method)) {
                instance[method] = instance[method].bind(instance);
            }
        }
    }

    objectInfo(value: unknown): string {
        return `${typeof value}/${value?.constructor?.name}`
    }

    checkObject(holder: string, type: string, obj: unknown, fn: string): void {
        if (!obj) {
            throw new Error(`Empty ${type}! info: ${this.objectInfo(obj)} in ${holder}`);
        }
        if (obj['$$leyyoType'] !== Symbol(fn)) {
            throw new Error(`Invalid ${type}! info: ${this.objectInfo(obj)} in ${holder}`);
        }
    }

    checkName(holder: string, type: string, value: string, canBeNull?: boolean): string {
        value = value ?? null;
        if (value === null) {
            if (canBeNull) {
                return null;
            }
            throw new Error(`Empty ${type}! info: ${this.objectInfo(value)} in ${holder}`);
        }
        if (typeof value === 'string') {
            value = value.trim();
            if (!value) {
                value = null;
            }
            if (!value) {
                if (canBeNull) {
                    return null;
                }
                throw new Error(`Empty ${type}! info: ${this.objectInfo(value)} in ${holder}`);
            }
        } else {
            throw new Error(`Invalid ${type}! info: ${this.objectInfo(value)} in ${holder}`);
        }
        return value;
    }

    checkLambda(holder: string, type: string, lambda: Function, min?: number): void {
        if (typeof lambda !== 'function') {
            throw new Error(`Invalid ${type}! lambda: ${this.objectInfo(lambda)} in ${holder}`);
        }
        if (min !== undefined && lambda.length < min) {
            throw new Error(`Invalid ${type} parameters! min: ${min} in ${holder}`);
        }
    }

    readProp<T>(prop: BuilderAny<T> | T): T {
        if (prop) {
            const builder = prop as BuilderAny<T>;
            if (typeof builder.$finalize === 'function') {
                builder.$finalize();
            }
            return prop as T;
        }
        return {} as T;
    }

    parseProperties(property: unknown, def: Array<string> = []): Array<string> {
        if (property === undefined || property == null) {
            return def;
        }
        switch (typeof property) {
            case "string":
                const str = property.trim();
                return str ? [str] : def;
            case "object":
                if (Array.isArray(property)) {
                    const arr = [];
                    property.forEach(item => {
                        if (typeof item === 'string') {
                            const str = item.trim();
                            if (str) {
                                arr.push(str);
                            }
                        }
                    });
                    return arr.length ? arr : def;
                }
                return def;
            default:
                return def;
        }
    }


    utcSec(seconds: number): number {
        return Math.floor(new Date().getTime() / 1000) + seconds;
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
        } else {
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

    asObject<T>(value: Record<string, T> | Object | Map<string, T> | Array<[string, T]>): Record<string, T> {
        if (value === undefined || value === null || typeof value !== 'object') {
            return {};
        }
        if (value instanceof Map) {
            return this._asObject(Object.fromEntries(value.entries()));
        } else if (Array.isArray(value)) {
            const arr = value as Array<unknown>;
            // @leyyo move, as isTuple
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
                } else if (key !== null) {
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
                } else {
                    obj[k] = def;
                }
            });
        } else {
            keys.forEach(k => {
                obj[k] = def;
            });
        }
        return obj;
    }
}

export const cacheUtil: CacheUtil = new CacheUtilImpl();