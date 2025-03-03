import {CacheChannel} from "../channel";
import {FieldId, FieldIddArray, Id, IdAny, IdAnyArray, IdArray, IdType, OneOrMore, TR} from "../types";
import {DLM_BETWEEN_PARTS, PRE_ALIAS, PRE_INVALIDATOR, PRE_KEY, PRE_OWNER} from "../config";
import {CacheFormat, CacheFormatBasics, CacheFormatRec, CacheFormatRecs, CacheFormatSecure} from "./types";
import {CacheFieldValue} from "../hash";
import {cacheUtil} from "../util";

// noinspection JSUnusedGlobalSymbols
export abstract class CacheFormatAbstract<A extends TR, N extends Id> implements CacheFormat<A, N>, CacheFormatSecure<A, N> {
    protected channel: CacheChannel<A, N>;
    protected readonly prefixes: Record<IdType, string>;

    protected constructor(channel: CacheChannel<A, N>) {
        this.channel = channel;
        this.prefixes = {
            key: PRE_KEY,
            invalidation: PRE_INVALIDATOR,
            alias: PRE_ALIAS,
            owner: PRE_OWNER,
            field: '',
            member: '',
        };
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

    private _toPlain(value: unknown): string {
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

    private _toPlainList(ids: Array<unknown>): Array<string> {
        if (!Array.isArray(ids) || ids.length < 1) {
            return [];
        }
        return ids
            .map(id => this._toPlain(id))
            .filter(id => id !== null)
            .filter((id, index, array) => array.indexOf(id) === index);
    }

    private _toDelimited(value: unknown): string {
        if (value === undefined || value == null) {
            return null;
        }
        switch (typeof value) {
            case "string":
                const str = value.trim();
                return str !== '' ? cacheUtil.alphaNumeric(str) : null;
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

    private _buildFull(short: string, idType: IdType): CacheFormatRec {
        if (short) {
            return {short, full: this._fullValue(this.prefixes[idType] ?? '', short)};
        }
        return {};
    }

    private _fullId(id: IdAny, type?: IdType): CacheFormatRec {
        id = this.basic(id);
        return id ? this._buildFull(id, type) : {};
    }

    private _fullIds(ids: IdAnyArray, type: IdType): CacheFormatRecs {
        // improper array
        if (!Array.isArray(ids) || ids.length < 1) {
            return {shorts: [], fulls: []};
        }
        // empty-valued array
        const result = ids.map(id => this.basic(id));
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

    // `${delim}${this.channel.full}${short}`
    protected abstract _fullValue(delim: string, short: string): string;

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
        return this._fullId(key, 'key');
    }

    keys(keys: IdAnyArray): CacheFormatRecs {
        return this._fullIds(keys, 'key');
    }

    basic(id: IdAny): string {
        if (Array.isArray(id)) {
            let arr = id as Array<Id>;
            if (arr.length < 1) {
                return null;
            }
            arr = arr.map(item => this._toDelimited(item));
            // trim array
            this._trim(arr);
            return arr.length > 0 ? arr.join(DLM_BETWEEN_PARTS) : null;
        }
        return this._toDelimited(id);
    }

    basics(ids: IdAnyArray): Array<string> {
        if (!Array.isArray(ids) || ids.length < 1) {
            return [];
        }
        return ids
            .map(id => this.basic(id))
            .filter(id => id !== null)
            .filter((id, index, array) => array.indexOf(id) === index);
    }

    alias(alias: IdAny): CacheFormatRec {
        return this._fullId(alias, 'alias');
    }

    aliases(aliases: IdAnyArray): CacheFormatRecs {
        return this._fullIds(aliases, 'alias');
    }

    owner(owner: IdAny): CacheFormatRec {
        return this._fullId(owner, 'owner');
    }

    owners(owners: IdAnyArray): CacheFormatRecs {
        return this._fullIds(owners, 'owner');
    }

    invalidation(invalidation: IdAny): CacheFormatRec {
        return this._fullId(invalidation, 'invalidation');
    }

    invalidations(invalidations: IdAnyArray): CacheFormatRecs {
        return this._fullIds(invalidations, 'owner');
    }

    field(field: Id | FieldId<A>): string {
        return this._toPlain(field);
    }

    fields(fields: IdArray | FieldIddArray<A>): Array<string> {
        return this._toPlainList(fields);
    }

    member(member: Id): string {
        return this._toPlain(member);
    }

    members(members: IdArray): Array<string> {
        return this._toPlainList(members);
    }

    memberShorts(members: IdArray): CacheFormatBasics {
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

    // endregion secure
}