import {AliasAny, AliasAnyArray, Id, KeyAny, TR} from "../types";
import {CacheAlias, CacheAliasDef, CacheAliasSecure, CmdAliasSet} from "./types";
import {CacheInvalidator} from "../invalidator";
import {CacheFormat} from "../format";
import {CacheChannel, CacheChannelProp, CacheChannelPropSecure} from "../channel";
import {cacheUtil} from "../util";
import {CacheResultBoolean, CacheResultNumber} from "../command";
import {CACHE_DISABLED, CACHE_EMPTY_KEY, CACHE_EMPTY_VALUE} from "../config";
import {CacheSetSecure} from "../set";
import {CacheBasic, CacheBasicSecure} from "../basic";

// noinspection DuplicatedCode,JSUnusedGlobalSymbols
export abstract class CacheAliasAbstract<A extends TR, N extends Id> implements CacheAlias<A, N>, CacheAliasSecure<A, N> {

    // region properties
    protected readonly channel: CacheChannel<A, N>;
    protected format: CacheFormat<A, N>;
    protected invalidator: CacheInvalidator<A>;
    protected prop: Readonly<CacheChannelProp<A>>;
    protected check: CacheChannelPropSecure<A>;
    protected basic: CacheBasic<A, N>;
    protected basicSecure: CacheBasicSecure<A, N>;
    protected setSecure: CacheSetSecure<A, N>;
    // endregion properties

    // region constructor
    protected constructor(channel: CacheChannel<A, N>) {
        this.channel = channel;

        cacheUtil.bindAll(this);
    }

    // endregion constructor

    // region regular

    async delete(alias: AliasAny): Promise<CacheResultNumber> {
        if (!this.prop.enabled) {
            return CACHE_DISABLED;
        }
        const aliasRec = this.format.alias(alias);
        if (!aliasRec.full) {
            return CACHE_EMPTY_KEY;
        }
        const owner = await this.getOwner(alias);
        if (owner) {
            const ownerRec = this.format.owner(owner);
            await this.setSecure.$remove(ownerRec.full, [aliasRec.short]);
        }
        return (await this.basicSecure.$delete(aliasRec.full)) ? 1 : 0;
    }

    async deleteMore(aliases: AliasAnyArray): Promise<CacheResultNumber> {
        if (!this.prop.enabled) {
            return CACHE_DISABLED;
        }
        const aliasRec = this.format.aliases(aliases);
        if (aliasRec.fulls.length < 1) {
            return CACHE_EMPTY_KEY;
        }
        for (const alias of aliases) {
            const aliasRec2 = this.format.alias(alias);
            if (aliasRec2.short) {
                const owner = await this.getOwner(alias);
                if (owner) {
                    const ownerRec = this.format.owner(owner);
                    await this.setSecure.$remove(ownerRec.full, [aliasRec2.short]);
                }
            }
        }
        return this.basicSecure.$deleteMore(aliasRec.fulls);
    }

    async exists(alias: AliasAny): Promise<CacheResultBoolean> {
        if (!this.prop.enabled) {
            return CACHE_DISABLED;
        }
        const aliasRec = this.format.alias(alias);
        if (!aliasRec.full) {
            return CACHE_EMPTY_KEY;
        }
        return (await this.basicSecure.$exists(aliasRec.full)) ? 1 : 0;
    }

    async existMore(aliases: AliasAnyArray): Promise<Array<CacheResultBoolean>> {
        if (!this.prop.enabled) {
            return [];
        }
        const {fulls} = this.format.aliases(aliases);
        if (fulls.length < 1) {
            return [];
        }
        return (await Promise.all(fulls.map(f => this.basicSecure.$exists(f)))).map(i => i ? 1 : 0);
    }

    async getDoc(alias: AliasAny): Promise<Partial<A>> {
        const owner = await this.getOwner(alias);
        if (!owner) {
            return null;
        }
        return (await this.basic.getDoc(owner)).result;
    }

    async getOwner(alias: AliasAny): Promise<string> {
        if (!this.prop.enabled) {
            return null;
        }
        const aliasRec = this.format.alias(alias);
        if (!aliasRec.full) {
            return null;
        }
        return this.basicSecure.$get(aliasRec.full);
    }

    async getRaw<T>(alias: AliasAny): Promise<T> {
        const owner = await this.getOwner(alias);
        if (!owner) {
            return null;
        }
        return (await this.basic.getRaw<T>(owner)).result;
    }

    async hasAlias(owner: KeyAny): Promise<CacheResultBoolean> {
        if (!this.prop.enabled) {
            return CACHE_DISABLED;
        }
        const ownerRec = this.format.owner(owner);
        if (!ownerRec.full) {
            return CACHE_EMPTY_KEY;
        }
        return (await this.basicSecure.$exists(ownerRec.full)) ? 1 : 0;
    }

    async listAliases(owner: KeyAny): Promise<Array<string>> {
        if (!this.prop.enabled) {
            return [];
        }
        const ownerRec = this.format.owner(owner);
        if (!ownerRec.full) {
            return [];
        }
        return cacheUtil.asArray(await this.setSecure.$list(ownerRec.full));
    }

    async listDocs(aliases: AliasAnyArray): Promise<Array<Partial<A>>> {
        const owners = await this.listOwners(aliases);
        if (owners?.length < 1) {
            return [];
        }
        return (await this.basic.listDocs(owners)).result;
    }

    async listOwners(aliases: AliasAnyArray): Promise<Array<string>> {
        if (!this.prop.enabled) {
            return [];
        }
        const aliasRec = this.format.aliases(aliases);
        if (aliasRec.fulls.length < 1) {
            return [];
        }
        return cacheUtil.asArray(await this.basicSecure.$getMore(aliasRec.fulls));
    }

    async listRaws<T>(aliases: AliasAnyArray): Promise<Array<T>> {
        const owners = await this.listOwners(aliases);
        if (owners?.length < 1) {
            return [];
        }
        return (await this.basic.listRaws<T>(owners)).result;
    }

    async setOwner(alias: AliasAny, owner: KeyAny, opt?: CmdAliasSet): Promise<CacheResultBoolean> {
        if (!this.prop.enabled) {
            return CACHE_DISABLED;
        }
        const aliasRec = this.format.alias(alias);
        if (!aliasRec.full) {
            return CACHE_EMPTY_KEY;
        }
        owner = this.format.basic(owner);
        const ownerRec = this.format.owner(owner);
        if (!ownerRec.full) {
            return CACHE_EMPTY_VALUE;
        }
        this.setSecure.$add(ownerRec.full, [aliasRec.short])
            .then(() => {
                if (opt?.expiry || opt?.span) {
                    const milliseconds = this.check.$timestamp(opt.expiry);
                    if (milliseconds > 0) {
                        switch (this.check.$saveSpan(opt.span)) {
                            case "persistent":
                                this.basicSecure.$persist(ownerRec.full).then();
                                break;
                            case "timestamp":
                                this.basicSecure.$setTimestamp(ownerRec.full, milliseconds).then();
                                break;
                            case "ttl":
                                this.basicSecure.$setTtl(ownerRec.full, milliseconds).then();
                                break;
                        }
                    }
                }
            });
        return ((await this.basicSecure.$set(aliasRec.full, owner)) === 'OK') ? 1 : 0;
    }

    async unlink(alias: AliasAny): Promise<CacheResultNumber> {
        if (!this.prop.enabled) {
            return CACHE_DISABLED;
        }
        const aliasRec = this.format.alias(alias);
        if (!aliasRec.full) {
            return CACHE_EMPTY_KEY;
        }
        return (await this.basicSecure.$unlink(aliasRec.full)) ? 1 : 0;
    }

    async unlinkMore(aliases: AliasAnyArray): Promise<CacheResultNumber> {
        if (!this.prop.enabled) {
            return CACHE_DISABLED;
        }
        const aliasRec = this.format.aliases(aliases);
        if (aliasRec.fulls.length < 1) {
            return CACHE_EMPTY_KEY;
        }
        return this.basicSecure.$unlinkMore(aliasRec.fulls);
    }

    // endregion regular

    // region secure
    get $flat(): CacheAliasDef {
        return this as CacheAliasDef;
    }

    get $secure(): CacheAliasSecure<A, N> {
        return this as CacheAliasSecure<A, N>;
    }

    get $back(): CacheAlias<A, N> {
        return this as CacheAlias<A, N>;
    }

    $init(): void {
        this.format = this.channel.format;
        this.invalidator = this.channel.invalidator;
        this.prop = this.channel.prop;
        this.check = this.channel.prop.$secure;
        this.basic = this.channel.basic;
        this.basicSecure = this.channel.basic.$secure;
        this.setSecure = this.channel.set.$secure;
    }

    // endregion secure

}