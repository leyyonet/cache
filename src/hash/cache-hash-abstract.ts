import {
    CacheField,
    CacheFieldIn,
    CacheFieldMap,
    CacheFieldPartial,
    CacheFieldPartialIn,
    CacheFields,
    CacheFieldsIn,
    CacheFieldTuples,
    CacheFieldValue,
    CacheFieldValues,
    CacheHash, CacheHashDef,
    CacheHashExpireResult,
    CacheHashFields
} from "./types";
import {CacheInvalidator} from "../invalidator";
import {CacheBaseAbstract} from "../base";
import {CacheID, CacheKey, TR} from "../channel";
import {CacheCmdExpire, CacheCmdExpireAt, CacheCmdInc, CacheCmdTtl} from "../command";

export abstract class CacheHashAbstract<A extends TR, N extends CacheID, C> extends CacheBaseAbstract<A, N, C> implements CacheHash<A, N, C> {

    protected _checkField(field: CacheFieldIn<A>): string {
        return this.util.asKey(field);
    }

    protected _checkFields(members: CacheFieldsIn<A>): CacheHashFields {
        if (!Array.isArray(members) || members.length < 1) {
            return {items: []};
        }
        const items = members
            .map(f => this._checkField(f))
            .filter(f => f !== null)
            .filter((f, index, array) => array.indexOf(f) === index);
        return {items, duplicated: members.length > items.length};
    }
    protected _checkValue(value: CacheFieldValue<A>): CacheFieldValue<A> {
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
    protected _checkValueDoc(value: Record<string, CacheFieldValue<A>>): Record<string, CacheFieldValue<A>> {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            return null;
        }
        const entries = Object.entries(value);
        if (entries.length < 1) {
            return null;
        }
        const obj = {} as Record<string, CacheFieldValue<A>>;
        for (const [k, v] of entries) {
            const field = this._checkField(k);
            if (field) {
                obj[field] = this._checkValue(v);
            }
        }
        if (Object.entries(obj).length < 1) {
            return null;
        }
        return obj;
    }
    get flattenGeneric$(): CacheHashDef {
        return this as CacheHashDef;
    }
    // region get
    abstract getAll(key: CacheKey<A>): Promise<CacheFieldPartial<A>>;
    abstract getOne(key: CacheKey<A>, field: CacheFieldIn<A>): Promise<CacheFieldValue<A>>;
    abstract getMore(key: CacheKey<A>, fields: CacheFieldsIn<A>): Promise<CacheFieldPartial<A>>;
    // endregion get

    // region set
    abstract setOne(key: CacheKey<A>, field: CacheFieldIn<A>, value: CacheFieldValue<A>): Promise<CacheInvalidator<A, N, C, number>>;
    abstract setMore(key: CacheKey<A>, doc: CacheFieldPartialIn<A>): Promise<CacheInvalidator<A, N, C, number>>;
    abstract setMore(key: CacheKey<A>, map: CacheFieldMap<A>): Promise<CacheInvalidator<A, N, C, number>>;
    abstract setMore(key: CacheKey<A>, tuples: CacheFieldTuples<A>): Promise<CacheInvalidator<A, N, C, number>>;
    // endregion set

    // region delete
    abstract deleteOne(key: CacheKey<A>, field: CacheFieldIn<A>): Promise<CacheInvalidator<A, N, C, number>>;
    abstract deleteMore(key: CacheKey<A>, fields: CacheFieldsIn<A>): Promise<CacheInvalidator<A, N, C, number>>;
    // endregion delete

    // region exists
    abstract hasField(key: CacheKey<A>, field: CacheFieldIn<A>): Promise<boolean>;
    abstract hasFields(key: CacheKey<A>, fields: CacheFieldsIn<A>): Promise<Record<string, boolean>>;
    // endregion exists

    // region expire
    abstract expire(key: CacheKey<A>, fields: CacheFieldsIn<A>, opt?: CacheCmdExpire): Promise<Record<string, CacheHashExpireResult>>;
    abstract expireAt(key: CacheKey<A>, fields: CacheFieldsIn<A>, opt?: CacheCmdExpireAt): Promise<Record<string, CacheHashExpireResult>>;
    abstract expireTime(key: CacheKey<A>, fields: CacheFieldsIn<A>, opt?: CacheCmdTtl): Promise<Record<string, number>>;
    abstract ttl(key: CacheKey<A>, fields: CacheFieldsIn<A>, opt?: CacheCmdTtl): Promise<Record<string, number>>;
    abstract persist(key: CacheKey<A>, fields: CacheFieldsIn<A>): Promise<Record<string, number>>;
    // endregion expire

    // region increment
    abstract increment(key: CacheKey<A>, field: CacheFieldIn<A>, opt: CacheCmdInc): Promise<CacheInvalidator<A, N, C, number>>;
    // endregion increment

    // region field-values
    abstract fields(key: CacheKey<A>): Promise<CacheFields<A>>;
    abstract length(key: CacheKey<A>): Promise<number>;
    abstract values(key: CacheKey<A>, fields: CacheFieldsIn<A>): Promise<CacheFieldValues<A>>;
    abstract allValues(key: CacheKey<A>): Promise<CacheFieldValues<A>>;
    // endregion field-values

    // region random
    abstract randomOne(key: CacheKey<A>): Promise<CacheField<A>>;
    abstract randomMore(key: CacheKey<A>, count: number): Promise<CacheFields<A>>;
    abstract randomValues(key: CacheKey<A>, count: number): Promise<CacheFieldPartial<A>>;
    // endregion random

}