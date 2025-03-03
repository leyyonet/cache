import {
    CacheBasic,
    CacheBasicDef,
    CacheBasicSecure,
    CacheCommandDisabledLambda, CacheCommandIgnoredLambda,
    CmdBasicCopy,
    CmdBasicGetTimestamp,
    CmdBasicGetTtl,
    CmdBasicInfoResult,
    CmdBasicSetBase,
    CmdBasicSetMoreBase,
    CmdBasicSetMoreWithProp,
    CmdBasicSetTimestamp,
    CmdBasicSetTtl,
    CmdBasicSetWithKey,
    CmdBasicSetWithProp,
    InvalidatorType
} from "./types";
import {Id, IdAny, KeyAny, KeyAnyArray, KeyId, TR} from "../types";
import {CacheFormat, CacheFormatRec} from "../format";
import {CacheInvalidator, CacheInvalidatorResult} from "../invalidator";
import {CacheChannel, CacheChannelProp, CacheChannelPropSecure} from "../channel";
import {cacheUtil} from "../util";
import {
    CacheOptCopy,
    CacheResulCopy,
    CacheResulSet,
    CacheResultBoolean,
    CacheResultGetExpiry,
    CacheResultNumber,
    CacheResultPersist,
    CacheResultSetExpiry
} from "../command";
import {ExpiryMode} from "../literal";
import {CACHE_DISABLED, CACHE_EMPTY_KEY, CACHE_EMPTY_VALUE} from "../config";

// noinspection DuplicatedCode,JSUnusedGlobalSymbols
export abstract class CacheBasicAbstract<A extends TR, N extends Id> implements CacheBasic<A, N>, CacheBasicSecure<A, N> {

    // region properties
    protected readonly channel: CacheChannel<A, N>;
    protected format: CacheFormat<A, N>;
    protected invalidator: CacheInvalidator<A>;
    protected prop: Readonly<CacheChannelProp<A>>;
    protected check: CacheChannelPropSecure<A>;
    protected ignoredMap: Map<InvalidatorType, CacheCommandIgnoredLambda<A, unknown>>;
    protected disabledMap: Map<InvalidatorType, CacheCommandDisabledLambda<A, unknown>>;
    // endregion properties

    // region constructor
    protected constructor(channel: CacheChannel<A, N>) {
        this.channel = channel;
        this.ignoredMap = new Map();
        this.disabledMap = new Map();
        cacheUtil.bindAll(this);
        this._fillInvalidators();
    }

    // endregion constructor

    // region private
    private _fillInvalidators() {
        this.disabledMap.set('boolean', this.invalidator.disabledFalse);
        this.ignoredMap.set('boolean', this.invalidator.ignoreFalse);

        this.disabledMap.set('number', this.invalidator.disabledNumber);
        this.ignoredMap.set('number', this.invalidator.ignoreNumber);

        this.disabledMap.set('string', this.invalidator.disabledText);
        this.ignoredMap.set('string', this.invalidator.ignoreText);

        this.disabledMap.set('array', this.invalidator.disabledArray);
        this.ignoredMap.set('array', this.invalidator.ignoreArray);

        this.disabledMap.set('object', this.invalidator.disabledRecord);
        this.ignoredMap.set('object', this.invalidator.ignoreRecord);
    }

    private _formatRawValue(value: string | number): string {
        switch (typeof value) {
            case "string":
                const str = value.trim();
                return str ? str : null;
            case "number":
            case "bigint":
                return String(value);
            case "boolean":
                return value ? 'true' : 'false';
            default:
                return null;
        }
    }

    private _afterSetMore(opt: CmdBasicSetMoreBase, fulls: Array<string>): void {
        if (!opt) {
            return;
        }
        if (!opt.span && !opt.expiry) {
            return;
        }
        let milliseconds: number;
        switch (this.check.$saveSpan(opt.span)) {
            case "persistent":
                this.$persistMore(fulls).then();
                break;
            case "timestamp":
                milliseconds = this.check.$timestamp(opt.expiry);
                if (milliseconds > 0) {
                    this.$setTimestampMore(fulls, milliseconds).then();
                }
                break;
            case "ttl":
                milliseconds = this.check.$timestamp(opt.expiry);
                if (milliseconds > 0) {
                    this.$setTtlMore(fulls, milliseconds).then();
                }
                break;
        }
    }

    private _setDocsMore(key: KeyAny, index: number, value: Partial<A>, formatted: Record<string, string>, keys: Array<string>) {
        const {full} = this.format.key(key);
        if (full) {
            if (!formatted[full]) {
                formatted[full] = cacheUtil.jsonOne(value);
                keys.push(full);
            } else {
                console.log(`Duplicated key: ${key}, index: ${index}`);
            }
        } else {
            console.log(`Invalid key: ${key}, index: ${index}`);
        }
    }

    private _setRawsMore<T extends string | number>(key: KeyAny, index: number, value: T, formatted: Record<string, string>, keys: Array<string>): void {
        const {full} = this.format.key(key);
        if (!formatted[full]) {
            const str = this._formatRawValue(value);
            if (!str) {
                console.log(`Invalid key: ${key}, index: ${index}`);
                return;
            }
            formatted[full] = str;
            keys.push(full);
        }
        console.log(`Duplicated key: ${key}, index: ${index}`);
    }

    // endregion private

    // region delete
    /** @inheritDoc */
    async delete(key: KeyAny): Promise<CacheInvalidatorResult<A, CacheResultBoolean>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledNumber(CACHE_DISABLED);
        }
        const {full} = this.format.key(key);
        if (!full) {
            return this.invalidator.ignoreNumber(CACHE_EMPTY_KEY, 'Empty key');
        }
        return this.invalidator.success((await this.$delete(full)) ? 1 : 0, [full]);
    }

    /** @inheritDoc */
    async deleteMore(keys: KeyAnyArray): Promise<CacheInvalidatorResult<A, CacheResultNumber>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledNumber(CACHE_DISABLED);
        }
        const {fulls} = this.format.keys(keys);
        if (fulls.length < 1) {
            return this.invalidator.ignoreNumber(CACHE_EMPTY_KEY, 'Empty keys');
        }
        return this.invalidator.success(await this.$deleteMore(fulls), fulls);
    }

    /** @inheritDoc */
    async unlink(key: KeyAny): Promise<CacheInvalidatorResult<A, CacheResultBoolean>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledNumber(CACHE_DISABLED);
        }
        const {full} = this.format.key(key);
        if (!full) {
            return this.invalidator.ignoreNumber(CACHE_EMPTY_KEY, 'Empty key');
        }
        return this.invalidator.success((await this.$unlink(full)) ? 1 : 0, [full]);
    }

    /** @inheritDoc */
    async unlinkMore(keys: KeyAnyArray): Promise<CacheInvalidatorResult<A, CacheResultNumber>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledNumber(CACHE_DISABLED);
        }
        const {fulls} = this.format.keys(keys);
        if (fulls.length < 1) {
            return this.invalidator.ignoreNumber(CACHE_EMPTY_KEY, 'Empty keys');
        }
        return this.invalidator.success(await this.$unlinkMore(fulls), fulls);
    }

    // endregion delete

    // region exists
    /** @inheritDoc */
    async exists(key: KeyAny): Promise<CacheInvalidatorResult<A, CacheResultBoolean>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledNumber(CACHE_DISABLED);
        }
        const {full} = this.format.key(key);
        if (!full) {
            return this.invalidator.ignoreNumber(CACHE_EMPTY_KEY, 'Empty key');
        }
        return this.invalidator.success((await this.$exists(full)) ? 1 : 0, [full]);
    }

    /** @inheritDoc */
    async existMore(keys: KeyAnyArray): Promise<CacheInvalidatorResult<A, CacheResultNumber>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledNumber(CACHE_DISABLED);
        }
        const {fulls} = this.format.keys(keys);
        if (fulls.length < 1) {
            return this.invalidator.ignoreNumber(CACHE_EMPTY_KEY, 'Empty keys');
        }
        return this.invalidator.success(await this.$existMore(fulls), fulls);
    }

    // endregion exists

    // region get
    /** @inheritDoc */
    async getDoc(key: KeyAny): Promise<CacheInvalidatorResult<A, A>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledNull();
        }
        const {full} = this.format.key(key);
        if (!full) {
            return this.invalidator.ignoreNull('Empty key');
        }
        this.invalidator.success(cacheUtil.parseOne(await this.$get(full)), [full]);
    }

    /** @inheritDoc */
    async listDocs(keys: KeyAnyArray): Promise<CacheInvalidatorResult<A, Array<A>>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledArray();
        }
        const {fulls} = this.format.keys(keys);
        if (fulls.length < 1) {
            return this.invalidator.ignoreArray('Empty keys');
        }
        return this.invalidator.success(cacheUtil.parseArray(cacheUtil.asArray(await this.$getMore(fulls))), fulls);
    }

    /** @inheritDoc */
    async getRaw<T>(key: KeyAny): Promise<CacheInvalidatorResult<A, T>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledNull();
        }
        const {full} = this.format.key(key);
        if (!full) {
            return this.invalidator.ignoreNull('Empty key');
        }
        this.invalidator.success(await this.$get(full), [full]);
    }

    /** @inheritDoc */
    async listRaws<T>(keys: KeyAnyArray): Promise<CacheInvalidatorResult<A, Array<T>>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledArray();
        }
        const {fulls} = this.format.keys(keys);
        if (fulls.length < 1) {
            return this.invalidator.ignoreArray('Empty keys');
        }
        return this.invalidator.success(cacheUtil.asArray(await this.$getMore(fulls)) as Array<T>, fulls);
    }

    // endregion get

    // region set
    async setDoc(p1: KeyAny | Partial<A>, p2?: Partial<A> | CmdBasicSetWithKey<A>, p3?: CmdBasicSetBase): Promise<CacheInvalidatorResult<A, Partial<A> | CacheResulSet>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledNumber(CACHE_DISABLED);
        }
        let key: CacheFormatRec;
        let value: Partial<A>;
        let opt: CmdBasicSetBase;
        // case 1, with key
        if (['string', 'number'].includes(typeof p1) || Array.isArray(p1)) {
            key = this.format.key(p1 as IdAny);
            if (!key.full) {
                return this.invalidator.ignoreNumber(CACHE_EMPTY_KEY);
            }
            value = p2 as Partial<A>;
            opt = p3 as CmdBasicSetBase;
            if (!opt) {
                opt = {};
            }
        }
        // case 2, without key
        else {
            value = p1 as Partial<A>;
            opt = p2 as CmdBasicSetBase;
            if (!opt) {
                opt = {};
            }
            // grab key from object with properties in options, else properties in config
            let properties = cacheUtil.parseProperties((opt as CmdBasicSetWithKey<A>).property, this.prop.property as Array<string>);
            if (properties.length < 1) {
                throw new Error('Key could not be created!')
            }
            const keyParts = properties.map(p => value[p]);
            key = this.format.key(keyParts);
            if (!key.full) {
                return this.invalidator.ignoreNumber(CACHE_EMPTY_KEY);
            }
        }
        if (!value) {
            return this.invalidator.ignoreNumber(CACHE_EMPTY_VALUE);
        }
        const result = await this.$set(key.full, cacheUtil.jsonOne(value), opt);
        if (opt.span === 'persistent') {
            // later
            this.$persist(key.full).then().catch(e => console.error(e));
        }
        if (opt.returnPrevious !== undefined) {
            return this.invalidator.success(cacheUtil.parseOne(result), [key.full]);
        }
        return this.invalidator.success(result === 'OK' ? 1 : 0, [key.full]);
    }

    async setRaw<T extends string | number>(key: KeyAny, value: T, opt?: CmdBasicSetBase): Promise<CacheInvalidatorResult<A, string | CacheResulSet>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledNumber(CACHE_DISABLED);
        }
        const {full} = this.format.key(key);
        if (!full) {
            return this.invalidator.ignoreNumber(CACHE_EMPTY_KEY);
        }
        const formattedValue = this._formatRawValue(value);
        if (!formattedValue) {
            return this.invalidator.ignoreNumber(CACHE_EMPTY_VALUE, 'Invalid type value');
        }
        const result = await this.$set(full, formattedValue, opt);
        if (opt.span === 'persistent') {
            // later
            this.$persist(full).then().catch(e => console.error(e));
        }
        if (opt.returnPrevious !== undefined) {
            return this.invalidator.success(result, [full]);
        }
        return this.invalidator.success(result === 'OK' ? 1 : 0, [full]);
    }

    async setDocsMore(values: Array<Partial<A>> | Record<KeyId, Partial<A>> | Map<KeyId, Partial<A>> | Array<[KeyId, Partial<A>]>, opt?: CmdBasicSetMoreWithProp<A> | CmdBasicSetMoreBase): Promise<CacheInvalidatorResult<A, CacheResulSet>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledNumber(CACHE_DISABLED);
        }
        if (!values) {
            return this.invalidator.ignoreNumber(CACHE_EMPTY_VALUE, 'Empty values');
        }
        if (typeof values !== 'object') {
            throw new Error('Invalid set data');
        }
        const formatted = {} as Record<string, string>;
        const keys = [];

        // Array<Partial<A>> | Array<[KeyId, Partial<A>]>
        if (Array.isArray(values)) {
            if (values.length < 1) {
                return this.invalidator.ignoreNumber(CACHE_EMPTY_VALUE, 'Empty array items');
            }
            const first = values[0];
            // Array<[KeyId, Partial<A>]>
            if (Array.isArray(first) && first.length === 2) {
                const arr = values as Array<[KeyId, Partial<A>]>;
                arr.forEach((item, index) => {
                    const [key, value] = item;
                    this._setDocsMore(key, index, value, formatted, keys);
                });
            }
            // Array<Partial<A>>
            else if (first && typeof first === 'object' && !Array.isArray(first)) {
                const arr = values as Array<Partial<A>>;
                const opt2 = opt as CmdBasicSetWithProp<A>;
                let properties = cacheUtil.parseProperties(opt2.property, this.prop.property as Array<string>);
                if (properties.length < 1) {
                    throw new Error('Key could not be created!')
                }
                arr.forEach((value, index) => {
                    const keyParts = properties.map(p => value[p]);
                    this._setDocsMore(keyParts, index, value, formatted, keys);
                });
            } else {
                throw new Error('Invalid set data');
            }
        }
        // Map<KeyId, Partial<A>>
        else if (values instanceof Map) {
            if (values.size < 1) {
                return this.invalidator.ignoreNumber(CACHE_EMPTY_VALUE, 'Empty map items');
            }
            let index = 0;
            for (const [key, value] of values.entries()) {
                this._setDocsMore(key, index, value, formatted, keys);
                index++;
            }
        }
        // Record<KeyId, Partial<A>>
        else {
            if (Object.keys(values).length < 1) {
                return this.invalidator.ignoreNumber(CACHE_EMPTY_VALUE, 'Empty record value');
            }
            let index = 0;
            for (const [key, value] of Object.entries(values)) {
                this._setDocsMore(key, index, value, formatted, keys);
                index++;
            }
        }
        if (keys.length < 1) {
            this.invalidator.ignoreNumber(CACHE_EMPTY_KEY);
        }
        const result = await this.$setMore(formatted);
        this._afterSetMore(opt, keys);
        return this.invalidator.success(result === 'OK' ? 1 : 0, keys);
    }

    async setRawsMore<T extends string | number>(values: Record<KeyId, T> | Map<KeyId, T> | Array<[KeyId, T]>, opt?: CmdBasicSetMoreBase): Promise<CacheInvalidatorResult<A, CacheResulSet>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledNumber(CACHE_DISABLED);
        }
        if (!values) {
            return this.invalidator.ignoreNumber(CACHE_EMPTY_VALUE, 'Empty value');
        }
        if (typeof values !== 'object') {
            throw new Error('Invalid set data');
        }
        const formatted = {} as Record<string, string>;
        const keys = [];

        // Array<Partial<A>> | Array<[KeyId, Partial<A>]>
        if (Array.isArray(values)) {
            if (values.length < 1) {
                return this.invalidator.ignoreNumber(CACHE_EMPTY_VALUE, 'Empty array items');
            }
            const first = values[0];
            // Array<[KeyId, Partial<A>]>
            if (Array.isArray(first) && first.length === 2) {
                const arr = values as Array<[KeyId, T]>;
                arr.forEach((item, index) => {
                    const [key, value] = item;
                    this._setRawsMore(key, index, value, formatted, keys);
                });
            } else {
                throw new Error('Invalid set data');
            }
        }
        // Map<KeyId, Partial<A>>
        else if (values instanceof Map) {
            if (values.size < 1) {
                return this.invalidator.ignoreNumber(CACHE_EMPTY_VALUE, 'Empty map items');
            }
            let index = 0;
            for (const [key, value] of values.entries()) {
                this._setRawsMore(key, index, value, formatted, keys);
                index++;
            }
        }
        // Record<KeyId, Partial<A>>
        else {
            if (Object.keys(values).length < 1) {
                return this.invalidator.ignoreNumber(CACHE_EMPTY_VALUE, 'Empty record value');
            }
            let index = 0;
            for (const [key, value] of Object.entries(values)) {
                this._setRawsMore(key, index, value, formatted, keys);
                index++;
            }
        }
        if (keys.length < 1) {
            this.invalidator.ignoreNumber(CACHE_EMPTY_KEY, 'Empty keys');
        }
        const result = await this.$setMore(formatted);
        this._afterSetMore(opt, keys);
        return this.invalidator.success(result === 'OK' ? 1 : 0, keys);
    }

    // endregion set

    // region other
    /** @inheritDoc */
    async copy(source: KeyAny, destination: KeyAny, opt?: CmdBasicCopy): Promise<CacheInvalidatorResult<A, CacheResulCopy>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledNumber(CACHE_DISABLED);
        }
        const sourceKey = this.format.key(source);
        if (!sourceKey.full) {
            return this.invalidator.ignoreNumber(CACHE_EMPTY_KEY, 'Source is empty');
        }
        const destinationKey = this.format.key(destination);
        if (!destinationKey.full) {
            return this.invalidator.ignoreNumber(CACHE_EMPTY_VALUE, 'Destination is empty');
        }
        return this.invalidator.success((await this.$copy(sourceKey.full, destinationKey.full, opt)) ? 1 : 0, [sourceKey.full, destinationKey.full]);
    }

    /** @inheritDoc */
    async getType(key: KeyAny): Promise<CacheInvalidatorResult<A, string>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledText();
        }
        const {full} = this.format.key(key);
        if (!full) {
            return this.invalidator.ignoreText('Empty key');
        }
        return this.invalidator.success(await this.$type(full), [full]);
    }

    /** @inheritDoc */
    async getTypeMore(keys: KeyAnyArray): Promise<CacheInvalidatorResult<A, Array<string>>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledArray();
        }
        const {fulls} = this.format.keys(keys);
        if (fulls.length < 1) {
            return this.invalidator.ignoreArray('Empty keys');
        }
        return this.invalidator.success(await this.$typeMore(fulls), fulls);
    }

    /** @inheritDoc */
    async getInfo(key: KeyAny): Promise<CmdBasicInfoResult> {
        if (!this.prop.enabled) {
            return null;
        }
        const {full} = this.format.key(key);
        if (!full) {
            return null;
        }
        return Promise.resolve(undefined);
    }

    // endregion other

    // region expiry

    /** @inheritDoc */
    async getTimestamp(key: KeyAny, opt?: CmdBasicGetTimestamp): Promise<CacheInvalidatorResult<A, CacheResultGetExpiry>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledNumber(CACHE_DISABLED);
        }
        const {full} = this.format.key(key);
        if (!full) {
            return this.invalidator.ignoreNumber(CACHE_EMPTY_KEY, 'Empty key');
        }
        const milliseconds = await this.$getTimestamp(full);

        if (milliseconds < 1) {
            return this.invalidator.success(milliseconds, [full]);
        }
        if (!opt) {
            opt = {};
        }
        const unit = this.check.$expiryUnit(opt.unit);
        switch (unit) {
            case "milliseconds":
                return this.invalidator.success(milliseconds, [full]);
            case 'seconds':
                return this.invalidator.success(Math.floor(milliseconds / 1_000), [full]);
            case 'minutes':
                return this.invalidator.success(Math.floor(milliseconds / 60_000), [full]);
            default:
                return this.invalidator.success(milliseconds, [full]);
        }
    }

    /** @inheritDoc */
    async getTimestampMore(keys: KeyAnyArray, opt?: CmdBasicGetTimestamp): Promise<CacheInvalidatorResult<A, Array<CacheResultGetExpiry>>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledArray();
        }
        const {fulls} = this.format.keys(keys);
        if (fulls.length < 1) {
            return this.invalidator.ignoreArray('Empty keys');
        }
        const times = await this.$getTimestampMore(fulls);
        if (times.length < 1) {
            return this.invalidator.success(times, fulls);
        }
        if (!opt) {
            opt = {};
        }
        const unit = this.check.$expiryUnit(opt.unit);
        switch (unit) {
            case "milliseconds":
                return this.invalidator.success(times, fulls);
            case 'seconds':
                return this.invalidator.success(times.map(ms => ms > 0 ? Math.floor(ms / 1_000) : ms), fulls);
            case 'minutes':
                return this.invalidator.success(times.map(ms => ms > 0 ? Math.floor(ms / 60_000) : ms), fulls);
            default:
                return this.invalidator.success(times, fulls);
        }
    }

    /** @inheritDoc */
    async getTtl(key: KeyAny, opt?: CmdBasicGetTtl): Promise<CacheInvalidatorResult<A, CacheResultGetExpiry>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledNumber(CACHE_DISABLED);
        }
        const {full} = this.format.key(key);
        if (!full) {
            return this.invalidator.ignoreNumber(CACHE_EMPTY_KEY, 'Empty key');
        }
        const milliseconds = await this.$getTtl(full);

        if (milliseconds < 1) {
            return this.invalidator.success(milliseconds, [full]);
        }
        if (!opt) {
            opt = {};
        }
        const unit = this.check.$expiryUnit(opt.unit);
        switch (unit) {
            case "milliseconds":
                return this.invalidator.success(milliseconds, [full]);
            case 'seconds':
                return this.invalidator.success(Math.floor(milliseconds / 1_000), [full]);
            case 'minutes':
                return this.invalidator.success(Math.floor(milliseconds / 60_000), [full]);
            default:
                return this.invalidator.success(milliseconds, [full]);
        }
    }

    /** @inheritDoc */
    async getTtlMore(keys: KeyAnyArray, opt?: CmdBasicGetTtl): Promise<CacheInvalidatorResult<A, Array<CacheResultGetExpiry>>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledArray();
        }
        const {fulls} = this.format.keys(keys);
        if (fulls.length < 1) {
            return this.invalidator.ignoreArray('Empty keys');
        }
        const times = await this.$getTtlMore(fulls);
        if (times.length < 1) {
            return this.invalidator.success(times, fulls);
        }
        if (!opt) {
            opt = {};
        }
        const unit = this.check.$expiryUnit(opt.unit);
        switch (unit) {
            case "milliseconds":
                return this.invalidator.success(times, fulls);
            case 'seconds':
                return this.invalidator.success(times.map(ms => ms > 0 ? Math.floor(ms / 1_000) : ms), fulls);
            case 'minutes':
                return this.invalidator.success(times.map(ms => ms > 0 ? Math.floor(ms / 60_000) : ms), fulls);
            default:
                return this.invalidator.success(times, fulls);
        }
    }

    /** @inheritDoc */
    async setTimestamp(key: KeyAny, opt?: CmdBasicSetTimestamp): Promise<CacheInvalidatorResult<A, CacheResultSetExpiry>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledNumber(CACHE_DISABLED);
        }
        const {full} = this.format.key(key);
        if (!full) {
            return this.invalidator.ignoreNumber(CACHE_EMPTY_KEY, 'Empty key');
        }
        if (!opt) {
            opt = {};
        }
        const milliseconds = this.check.$timestamp(opt.expiry);
        if (milliseconds < 1) {
            return this.invalidator.ignoreNumber(CACHE_EMPTY_VALUE, 'Invalid time value');
        }
        const mode = this.check.$expiryMode(opt.mode);
        this.invalidator.success(await this.$setTimestamp(full, milliseconds, mode), [full])
    }

    /** @inheritDoc */
    async setTimestampMore(keys: KeyAnyArray, opt?: CmdBasicSetTtl): Promise<CacheInvalidatorResult<A, Array<CacheResultSetExpiry>>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledArray();
        }
        const {fulls} = this.format.keys(keys);
        if (fulls.length < 1) {
            return this.invalidator.ignoreArray('Empty keys');
        }

        if (!opt) {
            opt = {};
        }
        const milliseconds = this.check.$timestamp(opt.expiry);
        if (milliseconds < 1) {
            return this.invalidator.ignoreArray('Invalid time value');
        }
        const mode = this.check.$expiryMode(opt.mode);
        this.invalidator.success(await this.$setTimestampMore(fulls, milliseconds, mode), fulls);
    }

    /** @inheritDoc */
    async setTtl(key: KeyAny, opt?: CmdBasicSetTtl): Promise<CacheInvalidatorResult<A, CacheResultSetExpiry>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledNumber(CACHE_DISABLED);
        }
        const {full} = this.format.key(key);
        if (!full) {
            return this.invalidator.ignoreNumber(CACHE_EMPTY_KEY, 'Empty key');
        }
        if (!opt) {
            opt = {};
        }
        const milliseconds = this.check.$timestamp(opt.expiry);
        if (milliseconds < 1) {
            return this.invalidator.ignoreNumber(CACHE_EMPTY_VALUE, 'Invalid time value');
        }
        const mode = this.check.$expiryMode(opt.mode);
        this.invalidator.success(await this.$setTtl(full, milliseconds, mode), [full])
    }

    /** @inheritDoc */
    async setTtlMore(keys: KeyAnyArray, opt?: CmdBasicSetTtl): Promise<CacheInvalidatorResult<A, Array<CacheResultSetExpiry>>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledArray();
        }
        const {fulls} = this.format.keys(keys);
        if (fulls.length < 1) {
            return this.invalidator.ignoreArray('Empty keys');
        }

        if (!opt) {
            opt = {};
        }
        const milliseconds = this.check.$timestamp(opt.expiry);
        if (milliseconds < 1) {
            return this.invalidator.ignoreArray('Invalid time value');
        }
        const mode = this.check.$expiryMode(opt.mode);
        this.invalidator.success(await this.$setTtlMore(fulls, milliseconds, mode), fulls);
    }

    /** @inheritDoc */
    async persist(key: KeyAny): Promise<CacheInvalidatorResult<A, CacheResultPersist>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledNumber(CACHE_DISABLED);
        }
        const {full} = this.format.key(key);
        if (!full) {
            return this.invalidator.ignoreNumber(CACHE_EMPTY_KEY, 'Empty key');
        }
        return this.invalidator.success(await this.$persist(full), [full]);
    }

    /** @inheritDoc */
    async persistMore(keys: KeyAnyArray): Promise<CacheInvalidatorResult<A, Array<CacheResultPersist>>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledArray();
        }
        const {fulls} = this.format.keys(keys);
        if (fulls.length < 1) {
            return this.invalidator.ignoreArray('Empty keys');
        }
        return this.invalidator.success(await this.$persistMore(fulls), fulls);
    }

    // endregion expiry

    // region secure
    get $flat(): CacheBasicDef {
        return this as CacheBasicDef;
    }

    get $secure(): CacheBasicSecure<A, N> {
        return this as CacheBasicSecure<A, N>;
    }

    get $back(): CacheBasic<A, N> {
        return this as CacheBasic<A, N>;
    }

    $init(): void {
        this.format = this.channel.format;
        this.invalidator = this.channel.invalidator;
        this.prop = this.channel.prop;
        this.check = this.channel.prop.$secure;
    }

    abstract $copy(source: string, destination: string, opt?: CacheOptCopy): Promise<boolean>;

    abstract $get(key: string): Promise<string>;

    abstract $getMore(keys: Array<string>): Promise<Array<string>>;

    abstract $exists(key: string): Promise<boolean>;

    abstract $existMore(keys: Array<string>): Promise<number>;

    abstract $set(key: string, value: string, opt?: CmdBasicSetBase): Promise<string>;

    abstract $setMore(records: Record<string, string>): Promise<string>;

    abstract $delete(key: string): Promise<boolean>;

    abstract $deleteMore(keys: Array<string>): Promise<number>;

    abstract $getTimestamp(key: string): Promise<CacheResultGetExpiry>;

    abstract $getTimestampMore(keys: Array<string>): Promise<Array<CacheResultGetExpiry>>;

    abstract $getTtl(key: string): Promise<CacheResultGetExpiry>;

    abstract $getTtlMore(keys: Array<string>): Promise<Array<CacheResultGetExpiry>>;

    abstract $type(key: string): Promise<string>;

    abstract $typeMore(keys: Array<string>): Promise<Array<string>>;

    abstract $persist(key: string): Promise<CacheResultPersist>;

    abstract $persistMore(keys: Array<string>): Promise<Array<CacheResultPersist>>;

    abstract $setTimestamp(key: string, milliseconds: number, mode?: ExpiryMode): Promise<CacheResultSetExpiry>;

    abstract $setTimestampMore(keys: Array<string>, milliseconds: number, mode?: ExpiryMode): Promise<Array<CacheResultSetExpiry>>;

    abstract $setTtl(key: string, milliseconds: number, mode?: ExpiryMode): Promise<CacheResultSetExpiry>;

    abstract $setTtlMore(keys: Array<string>, milliseconds: number, mode?: ExpiryMode): Promise<Array<CacheResultSetExpiry>>;

    abstract $unlink(key: string): Promise<boolean>;

    abstract $unlinkMore(keys: Array<string>): Promise<number>;

    // endregion secure
}