import {Id, KeyAny, TR} from "../types";
import {CacheSet, CacheSetDef, CacheSetSecure} from "./types";
import {CacheInvalidator, CacheInvalidatorResult} from "../invalidator";
import {CacheFormat} from "../format";
import {CacheChannel, CacheChannelProp, CacheChannelPropSecure} from "../channel";
import {cacheUtil} from "../util";
import {CacheResultBoolean, CacheResultNumber} from "../command";
import {CACHE_DISABLED, CACHE_EMPTY_KEY, CACHE_EMPTY_VALUE} from "../config";

// noinspection DuplicatedCode,JSUnusedGlobalSymbols
export abstract class CacheSetAbstract<A extends TR, N extends Id> implements CacheSet<A, N>, CacheSetSecure<A, N> {

    // region properties
    protected readonly channel: CacheChannel<A, N>;
    protected format: CacheFormat<A, N>;
    protected invalidator: CacheInvalidator<A>;
    protected prop: Readonly<CacheChannelProp<A>>;
    protected check: CacheChannelPropSecure<A>;
    // endregion properties

    // region constructor
    protected constructor(channel: CacheChannel<A, N>) {
        this.channel = channel;

        cacheUtil.bindAll(this);
    }

    // endregion constructor

    // region region

    async add(key: KeyAny, members: Array<N>): Promise<CacheInvalidatorResult<A, CacheResultNumber>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledNumber(CACHE_DISABLED);
        }

        const {full} = this.format.key(key);
        if (!full) {
            return this.invalidator.ignoreNumber(CACHE_EMPTY_KEY);
        }
        const {shorts} = this.format.memberShorts(members);
        if (shorts.length < 1) {
            return this.invalidator.ignoreNumber(CACHE_EMPTY_VALUE, 'Empty members');
        }
        return this.invalidator.success(await this.$add(full, shorts), [full]);
    }

    async existMore(key: KeyAny, members: Array<N>): Promise<CacheInvalidatorResult<A, Array<CacheResultBoolean>>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledArray();
        }
        const {full} = this.format.key(key);
        if (!full) {
            return this.invalidator.ignoreArray('Empty key');
        }
        const checkedMembers = this.format.members(members);
        if (checkedMembers.length < 1) {
            return this.invalidator.ignoreArray('Empty members');
        }
        const promises = checkedMembers.map(m => this.$exist(full, m)) as Array<Promise<boolean>>;
        const results = await Promise.all(promises);
        return this.invalidator.success(results.map(i => i ? 1 : 0), [full]);
    }

    async exists(key: KeyAny, member: N): Promise<CacheInvalidatorResult<A, CacheResultBoolean>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledNumber(CACHE_DISABLED);
        }
        const {full} = this.format.key(key);
        if (!full) {
            return this.invalidator.ignoreNumber(CACHE_EMPTY_KEY, 'Empty key');
        }
        const checkedMember = this.format.member(member);
        if (!checkedMember) {
            return this.invalidator.ignoreNumber(CACHE_EMPTY_VALUE, 'Empty member');
        }
        return this.invalidator.success((await this.$exist(full, checkedMember)) ? 1 : 0, [full]);
    }

    async getLength(key: KeyAny): Promise<CacheInvalidatorResult<A, CacheResultNumber>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledNumber(CACHE_DISABLED);
        }
        const {full} = this.format.key(key);
        if (!full) {
            return this.invalidator.ignoreNumber(CACHE_EMPTY_KEY, 'Empty key');
        }
        return this.invalidator.success(await this.$length(full), [full]);
    }

    async listMembers(key: KeyAny): Promise<CacheInvalidatorResult<A, Array<string>>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledArray();
        }
        const {full} = this.format.key(key);
        if (!full) {
            return this.invalidator.ignoreArray('Empty key');
        }
        return this.invalidator.success(await this.$list(full), [full]);
    }

    async remove(key: KeyAny, members: Array<N>): Promise<CacheInvalidatorResult<A, CacheResultNumber>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledNumber(CACHE_DISABLED);
        }
        const {full} = this.format.key(key);
        if (!full) {
            return this.invalidator.ignoreNumber(CACHE_EMPTY_VALUE);
        }
        const {shorts} = this.format.memberShorts(members);
        if (shorts.length < 1) {
            return this.invalidator.ignoreNumber(CACHE_EMPTY_VALUE, 'Empty members');
        }
        return this.invalidator.success(await this.$remove(full, shorts), [full]);
    }

    // endregion region

    // region secure
    get $flat(): CacheSetDef {
        return this as CacheSetDef;
    }

    get $secure(): CacheSetSecure<A, N> {
        return this as CacheSetSecure<A, N>;
    }

    get $back(): CacheSet<A, N> {
        return this as CacheSet<A, N>;
    }

    $init(): void {
        this.format = this.channel.format;
        this.invalidator = this.channel.invalidator;
        this.prop = this.channel.prop;
        this.check = this.channel.prop.$secure;
    }

    // SADD(full, shorts)
    abstract $add(key: string, members: Array<string>): Promise<number>;

    // SISMEMBER key member
    abstract $exist(key: string, member: string): Promise<boolean>;

    // SCARD(full)
    abstract $length(key: string): Promise<number>;

    // SMEMBERS(full)
    abstract $list(key: string): Promise<Array<string>>;

    // SREM(full, shorts)
    abstract $remove(key: string, members: Array<string>): Promise<number>;


    // endregion secure

}