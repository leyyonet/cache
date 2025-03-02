import {Id, KeyAny, TR} from "../types";
import {CacheSet, CacheSetDef, CacheSetSecure} from "./types";
import {CacheInvalidator, CacheInvalidatorResult} from "../invalidator";
import {CacheFormat} from "../format";
import {CacheChannel, CacheChannelProp, CacheChannelPropSecure} from "../channel";
import {cacheUtil} from "../util";

// noinspection DuplicatedCode,JSUnusedGlobalSymbols
export abstract class CacheSetAbstract<A extends TR, N extends Id> implements CacheSet<A, N>, CacheSetSecure<A, N> {

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

    // region region

    async add(key: KeyAny, members: Array<N>): Promise<CacheInvalidatorResult<A, number>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledZero();
        }

        const {full} = this.format.key(key);
        if (!full) {
            return this.invalidator.ignoreZero();
        }
        const {shorts} = this.format.memberShorts(members);
        if (shorts.length < 1) {
            return this.invalidator.ignoreZero();
        }
        return this.invalidator.success(await this.$add(full, shorts), [full]);
    }

    async existMore(key: KeyAny, members: Array<N>): Promise<CacheInvalidatorResult<A, Array<boolean>>> {
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
        return this.invalidator.success(results, [full]);
    }

    async exists(key: KeyAny, member: N): Promise<CacheInvalidatorResult<A, boolean>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledFalse();
        }
        const {full} = this.format.key(key);
        if (!full) {
            return this.invalidator.ignoreFalse('Empty key');
        }
        const checkedMember = this.format.member(member);
        if (!checkedMember) {
            return this.invalidator.ignoreFalse('Empty member');
        }
        return this.invalidator.success(await this.$exist(full, checkedMember), [full]);
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

    async remove(key: KeyAny, members: Array<N>): Promise<CacheInvalidatorResult<A, number>> {
        if (!this.prop.enabled) {
            return this.invalidator.disabledZero();
        }
        const {full} = this.format.key(key);
        if (!full) {
            return this.invalidator.ignoreZero();
        }
        const {shorts} = this.format.memberShorts(members);
        if (shorts.length < 1) {
            return this.invalidator.ignoreZero();
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