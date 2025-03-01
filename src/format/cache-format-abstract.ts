import {CacheChannel} from "../channel";
import {Id, IdAny, IdAnyArray, IdType, OneOrMore, TR} from "../types";
import {cacheConfig} from "../config";
import {CacheFormat, CacheFormatBasics, CacheFormatRec, CacheFormatRecs, CacheFormatSecure} from "./types";
import {CacheFieldValue} from "../hash";

// noinspection JSUnusedGlobalSymbols
export abstract class CacheFormatAbstract<A extends TR, N extends Id> implements CacheFormat<A, N>, CacheFormatSecure<A, N> {
    protected channel: CacheChannel<A, N>;

    protected constructor(channel: CacheChannel<A, N>) {
        this.channel = channel;
    }

    private _trim(ids: Array<Id>): void {
        if (ids[0] === null) {
            ids.splice(0, 1);
            this._trim(ids);
            return;
        } else if (ids[ids.length - 1] === null) {
            ids.splice(ids.length - 1, 1);
            this._trim(ids);
            return;
        }
        return;
    }

    private _cast(value: unknown): string {
        if (value === undefined || value == null) {
            return null;
        }
        switch (typeof value) {
            case "string":
                const str = value.trim();
                return str !== '' ? str : null;
            case "number":
                return value.toString(10);
            case "bigint":
                return String(value);
            case "boolean":
                return value ? 'true' : 'false';
            default:
                return null;
        }
    }

    private _castId(id: IdAny): string {
        if (Array.isArray(id)) {
            let arr = id as Array<Id>;
            if (arr.length < 1) {
                return null;
            }
            arr = arr.map(item => this._cast(item));
            // trim array
            this._trim(arr);
            return arr.length > 0 ? arr.join(cacheConfig.delimiterBetweenParts) : null;
        }
        return this._cast(id);
    }

    private _castIds(ids: IdAnyArray): Array<string> {
        if (!Array.isArray(ids) || ids.length < 1) {
            return [];
        }
        return ids
            .map(id => this._castId(id))
            .filter(id => id !== null)
            .filter((id, index, array) => array.indexOf(id) === index);
    }

    private _buildFull(short: string, type: IdType): CacheFormatRec {
        if (short) {
            let delim = '';
            switch (type) {
                case "key":
                    delim = cacheConfig.keyPrefix;
                    break;
                case "invalidation":
                    delim = cacheConfig.invalidationPrefix;
                    break;
                case "alias":
                    delim = cacheConfig.aliasPrefix;
                    break;
                case "owner":
                    delim = cacheConfig.ownerPrefix;
                    break;
            }
            return {short, full: `${delim}${this.channel.full}${short}`};
        }
        return {};
    }

    private _checkId(id: IdAny, type?: IdType): CacheFormatRec {
        id = this._castId(id);
        return id ? this._buildFull(id, type) : {};
    }

    private _checkIds(ids: IdAnyArray, type: IdType): CacheFormatRecs {
        // improper array
        if (!Array.isArray(ids) || ids.length < 1) {
            return {shorts: [], fulls: []};
        }
        // empty-valued array
        const result = ids.map(id => this._castId(id));
        if (result.length < 1) {
            return {shorts: [], fulls: []};
        }
        // converts to full
        const fulls = result.map(id => this._buildFull(id, type));
        return {
            shorts: fulls.map(id => id.short),
            fulls: fulls.map(id => id.full),
            duplicated: ids?.length > fulls.length
        };
    }

    checkName<A>(property: OneOrMore<string | keyof A>): Array<string> {
        if (!property) {
            return [];
        } else if (typeof property === 'string') {
            return [property];
        } else if (Array.isArray(property)) {
            return property.filter(p => p).map(p => String(p));
        }
        return [];
    }

    key(key: IdAny): CacheFormatRec {
        return this._checkId(key, 'key');
    }

    keys(keys: IdAnyArray): CacheFormatRecs {
        return this._checkIds(keys, 'key');
    }

    basic(field: IdAny): string {
        return this._castId(field);
    }

    basics(fields: IdAnyArray): Array<string> {
        return this._castIds(fields);
    }

    alias(alias: IdAny): CacheFormatRec {
        return this._checkId(alias, 'alias');
    }

    aliases(aliases: IdAnyArray): CacheFormatRecs {
        return this._checkIds(aliases, 'alias');
    }

    owner(owner: IdAny): CacheFormatRec {
        return this._checkId(owner, 'owner');
    }

    owners(owners: IdAnyArray): CacheFormatRecs {
        return this._checkIds(owners, 'owner');
    }

    invalidation(invalidation: IdAny): CacheFormatRec {
        return this._checkId(invalidation, 'invalidation');
    }

    invalidations(invalidations: IdAnyArray): CacheFormatRecs {
        return this._checkIds(invalidations, 'owner');
    }

    field(field: IdAny): string {
        return this._castId(field);
    }

    fields(fields: IdAnyArray): Array<string> {
        return this._castIds(fields);
    }

    member(member: IdAny): string {
        return this._castId(member);
    }

    members(members: IdAnyArray): Array<string> {
        return this._castIds(members);
    }

    memberShorts(members: IdAnyArray): CacheFormatBasics {
        const arr = this.members(members);
        return {shorts: arr, duplicated: arr.length < members?.length};
    }

    value(value: CacheFieldValue<A>): CacheFieldValue<A> {
        if (value === undefined || value == null) {
            return null;
        }
        switch (typeof value) {
            case "string":
                return value.trim();
            case "bigint":
                return value.toString(10);
            case "number":
                return value;
            case "boolean":
                return value ? 'true' : 'false';
            default:
                try {
                    return JSON.stringify(value);
                } catch (e) {
                    return null;
                }
        }
    }

    valueDoc(value: Record<string, CacheFieldValue<A>>): Record<string, CacheFieldValue<A>> {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            return null;
        }
        const entries = Object.entries(value);
        if (entries.length < 1) {
            return null;
        }
        const obj = {} as Record<string, CacheFieldValue<A>>;
        for (const [k, v] of entries) {
            const field = this.basic(k);
            if (field) {
                obj[field] = this.value(v);
            }
        }
        if (Object.entries(obj).length < 1) {
            return null;
        }
        return obj;
    }

    // region secure
    get $back(): CacheFormat<A, N> {
        return this;
    }

    get $secure(): CacheFormatSecure<A, N> {
        return this;
    }

    abstract $setChannelFull(): void;

    // endregion secure
}