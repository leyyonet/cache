import {FieldId, FieldIddArray, FieldMap, FieldTupleArray, FieldValue, Id, KeyAny, TR} from "../types";
import {
    CacheHash,
    CacheHashDef,
    CacheHashExpireResult,
    CacheHashSecure,
    CmdHashGetTimestamp,
    CmdHashGetTtl,
    CmdHashSetTimestamp,
    CmdHashSetTtl
} from "./types";
import {CacheInvalidator, CacheInvalidatorResult} from "../invalidator";
import {CacheFormat} from "../format";
import {CacheChannel, CacheChannelProp, CacheChannelPropSecure} from "../channel";
import {cacheUtil} from "../util";
import {ExpiryMode} from "../literal";

// noinspection DuplicatedCode,JSUnusedGlobalSymbols
export abstract class CacheHashAbstract<A extends TR, N extends Id> implements CacheHash<A, N>, CacheHashSecure<A, N> {

    // region properties
    protected readonly format: CacheFormat<A, N>;
    protected readonly invalidator: CacheInvalidator<A>;
    protected readonly prop: Readonly<CacheChannelProp<A>>;
    protected readonly check: CacheChannelPropSecure<A>;
    // endregion properties

    // region constructor
    protected constructor(channel: CacheChannel<A, N>) {
        this.format = channel.format;
        this.invalidator = channel.invalidator;
        this.prop = channel.prop;
        this.check = channel.prop.$secure;

        cacheUtil.bindAll(this);
    }
    // endregion constructor

    // region private
    private _formatRawValue(field: string, value: FieldValue<A>, throwable: boolean = true): string {
        switch (typeof value) {
            case "string":
                const str = value.trim();
                if (str) {
                    return str;
                }
                if (throwable) {
                    throw new Error(`Empty value for field[${field}]`);
                }
                return null;
            case "number":
            case "bigint":
                return String(value);
            case "boolean":
                return value ? 'true' : 'false';
            default:
                if (!value) {
                    if (throwable) {
                        throw new Error(`Empty value for field[${field}]`);
                    }
                    return null;
                }
                if (throwable) {
                    throw new Error(`Invalid field[${field}] value, type of value: ${typeof value}`);
                }
                return null;
        }
    }

    private _formatRawValues(record: Record<string, FieldValue<A>>, throwable: boolean = true): Record<string, string> {
        const errors = [];
        const result = {} as Record<string, string>;
        for (const [field, value] of Object.entries(record)) {
            switch (typeof value) {
                case "string":
                    const str = value.trim();
                    if (str) {
                        result[field] = str;
                    }
                    else if (throwable) {
                        errors.push(`Empty value for field[${field}]`);
                    }
                    break;
                case "number":
                case "bigint":
                    result[field] = String(value);
                    break;
                case "boolean":
                    result[field] = value ? 'true' : 'false';
                    break;
                default:
                    if (!value) {
                        if (throwable) {
                            errors.push(`Empty value for field[${field}]`);
                        }
                    }
                    else if (throwable) {
                        errors.push(`Invalid field[${field}] value, type of value: ${typeof value}`);
                    }
                    break;
            }
        }
        if (Object.keys(result).length < 1 && throwable) {
            errors.push(`Empty value set`);
        }
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
        return result;
    }
    // endregion private

    // region delete
    async delete(key: KeyAny, fields: FieldIddArray<A>): Promise<CacheInvalidatorResult<A, number>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledZero();
        }
        const {full} = this.format.key(key);
        if (!full) {
            return this.invalidator.ignoreZero('Empty key');
        }
        const items = this.format.fields(fields);
        if (items.length < 1) {
            return this.invalidator.ignoreZero('Empty fields');
        }
        return this.invalidator.success(await this.$delete(full, items), [full]);
    }
    // endregion delete

    // region members
    async exists(key: KeyAny, field: FieldId<A>): Promise<CacheInvalidatorResult<A, boolean>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledFalse();
        }
        const {full} = this.format.key(key);
        if (!full) {
            return this.invalidator.ignoreFalse('Empty key');
        }
        const item = this.format.field(field);
        if (!item) {
            return this.invalidator.ignoreFalse('Empty field');
        }
        return this.invalidator.success(await this.$exists(full, item), [full]);
    }
    async existMore(key: KeyAny, fields: FieldIddArray<A>): Promise<CacheInvalidatorResult<A, Array<boolean>>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledArray();
        }
        const {full} = this.format.key(key);
        if (!full) {
            return this.invalidator.ignoreArray('Empty key');
        }
        const items = this.format.fields(fields);
        if (items.length < 1) {
            return this.invalidator.ignoreArray('Empty fields');
        }
        return this.invalidator.success(await Promise.all(items.map(item => this.$exists(full, item))), [full]);
    }
    async getLength(key: KeyAny): Promise<CacheInvalidatorResult<A, number>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledZero();
        }
        const {full} = this.format.key(key);
        if (!full) {
            return this.invalidator.ignoreZero('Empty key');
        }
        return this.invalidator.success(await this.$length(full), [full]);
    }
    async listFields(key: KeyAny): Promise<CacheInvalidatorResult<A, FieldIddArray<A>>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledArray();
        }
        const {full} = this.format.key(key);
        if (!full) {
            return this.invalidator.ignoreArray('Empty key');
        }
        return this.invalidator.success(await this.$fields(full), [full]);
    }
    // endregion members

    // region get
    async getAll(key: KeyAny): Promise<CacheInvalidatorResult<A, Record<string, string>>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledNull();
        }
        const {full} = this.format.key(key);
        if (!full) {
            return this.invalidator.ignoreNull('Empty key');
        }
        return this.invalidator.success(await this.$getAll(full), [full]);
    }

    async getMore(key: KeyAny, fields: FieldIddArray<A>): Promise<CacheInvalidatorResult<A, Record<string, string>>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledNull();
        }
        const {full} = this.format.key(key);
        if (!full) {
            return this.invalidator.ignoreNull('Empty key');
        }
        const items = this.format.fields(fields);
        if (items.length < 1) {
            return this.invalidator.ignoreNull('Empty fields');
        }
        const values = await this.$get(full, items);
        return this.invalidator.success(cacheUtil.objectFromKeys(items, null, values), [full]);
    }
    async getValue(key: KeyAny, field: FieldId<A>): Promise<CacheInvalidatorResult<A, string>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledText();
        }
        const {full} = this.format.key(key);
        if (!full) {
            return this.invalidator.ignoreText('Empty key');
        }
        const checkedField = this.format.field(field);
        if (!checkedField) {
            return this.invalidator.ignoreText('Empty field');
        }
        return this.invalidator.success(await this.$getOne(full, checkedField), [full]);
    }
    // endregion get

    // region set
    async setValue(key: KeyAny, field: FieldId<A>, value: FieldValue<A>): Promise<CacheInvalidatorResult<A, number>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledZero();
        }
        const {full} = this.format.key(key);
        if (!full) {
            return this.invalidator.ignoreZero('Empty key');
        }
        const checkField = this.format.field(field);
        if (!checkField) {
            return this.invalidator.ignoreZero('Empty field');
        }
        const str = this._formatRawValue(checkField, value, true);
        return this.invalidator.success(await this.$set(full, {[checkField]: str}), [full]);
    }

    async setValuesMore(key: KeyAny, doc: Partial<A> | FieldMap<A> | FieldTupleArray<A>): Promise<CacheInvalidatorResult<A, number>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledZero();
        }
        const {full} = this.format.key(key);
        if (!full) {
            return this.invalidator.ignoreZero('Empty key');
        }
        if (!doc) {
            return this.invalidator.ignoreZero('Empty values');
        }
        if (typeof doc !== 'object') {
            throw new Error('Invalid set data');
        }
        const tempValue = {} as Record<FieldId<A>, FieldValue<A>>;
        // Array<Partial<A>> | Array<[KeyId, Partial<A>]>
        if (Array.isArray(doc)) {
            if (doc.length < 1) {
                return this.invalidator.ignoreZero('Empty array items');
            }
            const first = doc[0];
            // FieldTupleArray<A>
            if (Array.isArray(first) && first.length === 2) {
                const arr = doc as FieldTupleArray<A>;
                arr.forEach(item => {
                    const [key, value] = item;
                    tempValue[key] = value;
                });
            }
            // normal array
            else {
                return this.invalidator.ignoreZero('Invalid array tuples');
            }
        }
        // FieldMap<A>
        else if (doc instanceof Map) {
            if (doc.size < 1) {
                return this.invalidator.ignoreZero('Empty map items');
            }
            for (const [key, value] of doc.entries()) {
                tempValue[key] = value;
            }
        }
        // Partial<A>
        else {
            if (Object.keys(doc).length < 1) {
                return this.invalidator.ignoreZero('Empty record value');
            }
            for (const [key, value] of Object.entries(doc)) {
                tempValue[key as FieldId<A>] = value;
            }
        }
        const formatted = this._formatRawValues(tempValue, true);

        if (Object.keys(formatted).length < 1) {
            return this.invalidator.ignoreZero('Empty record value');
        }
        return this.invalidator.success(await this.$set(full, formatted), [full]);
    }
    // endregion set

    // region expiry
    async getTimestamp(key: KeyAny, fields: FieldIddArray<A>, opt?: CmdHashGetTimestamp): Promise<CacheInvalidatorResult<A, Record<string, number>>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledRecord();
        }
        const {full} = this.format.key(key);
        if (!full) {
            return this.invalidator.ignoreRecord('Empty key');
        }
        const items = this.format.fields(fields);
        if (items.length < 1) {
            return this.invalidator.ignoreRecord('Empty fields');
        }
        const times = await this.$getTimestamp(full, items);
        if (times.length < 1) {
            return this.invalidator.success({}, [full]);
        }

        const unit = this.check.$expiryUnit(opt?.unit);
        switch (unit) {
            case "milliseconds":
                return this.invalidator.success(cacheUtil.objectFromKeys(items, 0, times), [full]);
            case 'seconds':
                return this.invalidator.success(cacheUtil.objectFromKeys(times.map(time => time / 1_000), 0, times), [full]);
            case 'minutes':
                return this.invalidator.success(cacheUtil.objectFromKeys(times.map(time => time / 60_000), 0, times), [full]);
            default:
                return this.invalidator.success(cacheUtil.objectFromKeys(items, 0, times), [full]);
        }
    }

    async getTtl(key: KeyAny, fields: FieldIddArray<A>, opt?: CmdHashGetTtl): Promise<CacheInvalidatorResult<A, Record<string, number>>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledRecord();
        }
        const {full} = this.format.key(key);
        if (!full) {
            return this.invalidator.ignoreRecord('Empty key');
        }
        const items = this.format.fields(fields);
        if (items.length < 1) {
            return this.invalidator.ignoreRecord('Empty fields');
        }
        const times = await this.$getTtl(full, items);
        if (times.length < 1) {
            return this.invalidator.success({}, [full]);
        }

        const unit = this.check.$expiryUnit(opt?.unit);
        switch (unit) {
            case "milliseconds":
                return this.invalidator.success(cacheUtil.objectFromKeys(items, 0, times), [full]);
            case 'seconds':
                return this.invalidator.success(cacheUtil.objectFromKeys(times.map(time => time / 1_000), 0, times), [full]);
            case 'minutes':
                return this.invalidator.success(cacheUtil.objectFromKeys(times.map(time => time / 60_000), 0, times), [full]);
            default:
                return this.invalidator.success(cacheUtil.objectFromKeys(items, 0, times), [full]);
        }
    }

    async setTimestamp(key: KeyAny, fields: FieldIddArray<A>, opt?: CmdHashSetTimestamp): Promise<CacheInvalidatorResult<A, Record<string, CacheHashExpireResult>>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledRecord();
        }
        const {full} = this.format.key(key);
        if (!full) {
            return this.invalidator.ignoreRecord('Empty key');
        }
        const items = this.format.fields(fields);
        if (items.length < 1) {
            return this.invalidator.ignoreRecord('Empty fields');
        }
        if (!opt) {
            opt = {};
        }
        const milliseconds = this.check.$timestamp(opt.expiry);
        if (milliseconds < 1) {
            return this.invalidator.ignoreRecord('Invalid time value');
        }
        const mode = this.check.$expiryMode(opt.mode);
        const result = await this.$setTimestamp(full, items, milliseconds, mode);

        return this.invalidator.success(cacheUtil.objectFromKeys(result, -1 as CacheHashExpireResult, result), [full]);
    }

    async setTtl(key: KeyAny, fields: FieldIddArray<A>, opt?: CmdHashSetTtl): Promise<CacheInvalidatorResult<A, Record<string, CacheHashExpireResult>>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledRecord();
        }
        const {full} = this.format.key(key);
        if (!full) {
            return this.invalidator.ignoreRecord('Empty key');
        }
        const items = this.format.fields(fields);
        if (items.length < 1) {
            return this.invalidator.ignoreRecord('Empty fields');
        }
        if (!opt) {
            opt = {};
        }
        const milliseconds = this.check.$timestamp(opt.expiry);
        if (milliseconds < 1) {
            return this.invalidator.ignoreRecord('Invalid time value');
        }
        const mode = this.check.$expiryMode(opt.mode);
        const result = await this.$setTtl(full, items, milliseconds, mode);

        return this.invalidator.success(cacheUtil.objectFromKeys(result, -1 as CacheHashExpireResult, result), [full]);
    }

    async persist(key: KeyAny, fields: FieldIddArray<A>): Promise<CacheInvalidatorResult<A, Record<string, number>>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledRecord();
        }
        const {full} = this.format.key(key);
        if (!full) {
            return this.invalidator.ignoreRecord('Empty key');
        }
        const items = this.format.fields(fields);
        if (items.length < 1) {
            return this.invalidator.ignoreRecord('Empty fields');
        }
        const result = await this.$persist(full, items);
        return this.invalidator.success(cacheUtil.objectFromKeys(items, -2, result), [full]);
    }
    // endregion expiry

    // region secure
    get $flat(): CacheHashDef {
        return this as CacheHashDef;
    }

    get $secure(): CacheHashSecure<A, N> {
        return this as CacheHashSecure<A, N>;
    }

    get $back(): CacheHash<A, N> {
        return this as CacheHash<A, N>;
    }

    // HDEL(full, items)
    abstract $delete(key: string, fields: Array<string>): Promise<number>;

    // HEXISTS key field
    abstract $exists(key: string, field: string): Promise<boolean>;
    abstract $existsMore(key: string, fields: Array<string>): Promise<Record<string, boolean>>;

    // HKEYS(full)
    abstract $fields(key: string): Promise<Array<string>>;

    // HGET
    abstract $getOne(key: string, field: string): Promise<string>;

    // HMGET
    abstract $get(key: string, fields: Array<string>): Promise<Array<string>>;
    // HGETALL
    abstract $getAll(key: string): Promise<Record<string, string>>;



    // HLEN(full)
    abstract $length(key: string): Promise<number>;

    // HPERSIST
    abstract $persist(key: string, fields: Array<string>): Promise<Array<number>>;

    // HSET
    abstract $set(key: string, record: Record<string, string>): Promise<number>;

    // HPEXPIRETIME
    abstract $getTimestamp(key: string, fields: Array<string>): Promise<Array<number>>;
    // HPEXPIREAT
    abstract $setTimestamp(key: string, fields: Array<string>, milliseconds: number, mode?: ExpiryMode): Promise<Array<CacheHashExpireResult>>;

    // HPTTL
    abstract $getTtl(key: string, fields: Array<string>): Promise<Array<number>>;
    // HPEXPIRE
    abstract $setTtl(key: string, fields: Array<string>, milliseconds: number, mode?: ExpiryMode): Promise<Array<CacheHashExpireResult>>;
    // endregion secure
}