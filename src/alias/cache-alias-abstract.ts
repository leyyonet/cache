import {AliasAny, AliasAnyArray, Id, KeyAny, TR} from "../types";
import {CacheAlias, CacheAliasDef} from "./types";
import {CacheInvalidator} from "../invalidator";
import {CacheFormat} from "../format";
import {CacheChannel, CacheChannelProp, CacheChannelPropSecure} from "../channel";
import {cacheUtil} from "../util";

// noinspection DuplicatedCode,JSUnusedGlobalSymbols
export abstract class CacheAliasAbstract<A extends TR, N extends Id> implements CacheAlias<A, N> {

    // region properties
    protected readonly format: CacheFormat<A, N>;
    protected readonly invalidator: CacheInvalidator<A>;
    protected readonly prop: Readonly<CacheChannelProp<A>>;
    protected readonly check: CacheChannelPropSecure<A>;
    protected readonly channel: CacheChannel<A, N>;
    // endregion properties

    // region constructor
    protected constructor(channel: CacheChannel<A, N>) {
        this.channel = channel;
        this.format = channel.format;
        this.invalidator = channel.invalidator;
        this.prop = channel.prop;
        this.check = channel.prop.$secure;

        cacheUtil.bindAll(this);
    }
    // endregion constructor

    // region regular

    async delete(alias: AliasAny): Promise<boolean> {
        if (!this.prop.enabled) {
            return false;
        }
        const aliasRec = this.format.alias(alias);
        if (!aliasRec.full) {
            return false;
        }
        const owner = await this.getOwner(alias);
        if (owner) {
            const ownerRec = this.format.owner(owner);
            await this.channel.set.$secure.$remove(ownerRec.full, [aliasRec.short]);
        }
        return this.channel.basic.$secure.$delete(aliasRec.full);
    }

    async deleteMore(aliases: AliasAnyArray): Promise<number> {
        if (!this.prop.enabled) {
            return 0;
        }
        const aliasRec = this.format.aliases(aliases);
        if (aliasRec.fulls.length < 1) {
            return 0;
        }
        for (const alias of aliases) {
            const aliasRec2 = this.format.alias(alias);
            if (aliasRec2.short) {
                const owner = await this.getOwner(alias);
                if (owner) {
                    const ownerRec = this.format.owner(owner);
                    await this.channel.set.$secure.$remove(ownerRec.full, [aliasRec2.short]);
                }
            }
        }
        return this.channel.basic.$secure.$deleteMore(aliasRec.fulls);
    }

    async exists(alias: AliasAny): Promise<boolean> {
        if (!this.prop.enabled) {
            return false;
        }
        const aliasRec = this.format.alias(alias);
        if (!aliasRec.full) {
            return false;
        }
        return this.channel.basic.$secure.$exists(aliasRec.full);
    }

    async getDoc(alias: AliasAny): Promise<Partial<A>> {
        const owner = await this.getOwner(alias);
        if (!owner) {
            return null;
        }
        return (await this.channel.basic.getDoc(owner)).result;
    }

    async getOwner(alias: AliasAny): Promise<KeyAny> {
        if (!this.prop.enabled) {
            return null;
        }
        const aliasRec = this.format.alias(alias);
        if (!aliasRec.full) {
            return null;
        }
        return this.channel.basic.$secure.$get(aliasRec.full);
    }

    async getRaw<T>(alias: AliasAny): Promise<T> {
        const owner = await this.getOwner(alias);
        if (!owner) {
            return null;
        }
        return (await this.channel.basic.getRaw<T>(owner)).result;
    }

    async hasAlias(owner: KeyAny): Promise<boolean> {
        if (!this.prop.enabled) {
            return false;
        }
        const ownerRec = this.format.owner(owner);
        if (!ownerRec.full) {
            return false;
        }
        return this.channel.basic.$secure.$exists(ownerRec.full);
    }

    async listAliases(owner: KeyAny): Promise<Array<AliasAny>> {
        if (!this.prop.enabled) {
            return [];
        }
        const ownerRec = this.format.owner(owner);
        if (!ownerRec.full) {
            return [];
        }
        return cacheUtil.asArray(await this.channel.set.$secure.$list(ownerRec.full));
    }

    async listDocs(aliases: AliasAnyArray): Promise<Array<Partial<A>>> {
        const owners = await this.listOwners(aliases);
        if (owners?.length < 1) {
            return [];
        }
        return (await this.channel.basic.listDocs(owners)).result;
    }

    async listOwners(aliases: AliasAnyArray): Promise<Array<KeyAny>> {
        if (!this.prop.enabled) {
            return [];
        }
        const aliasRec = this.format.aliases(aliases);
        if (aliasRec.fulls.length < 1) {
            return [];
        }
        return cacheUtil.asArray(await this.channel.basic.$secure.$getMore(aliasRec.fulls));
    }

    async listRaws<T>(aliases: AliasAnyArray): Promise<Array<T>> {
        const owners = await this.listOwners(aliases);
        if (owners?.length < 1) {
            return [];
        }
        return (await this.channel.basic.listRaws<T>(owners)).result;
    }

    async setOwner(alias: AliasAny, owner: KeyAny): Promise<boolean> {
        if (!this.prop.enabled) {
            return false;
        }
        const aliasRec = this.format.alias(alias);
        if (!aliasRec.full) {
            return false;
        }
        owner = this.format.basic(owner);
        const ownerRec = this.format.owner(owner);
        if (!ownerRec.full) {
            return false;
        }

        this.channel.set.$secure.$add(ownerRec.full, [aliasRec.short]).then();
        return (await this.channel.basic.$secure.$set(aliasRec.full, owner)) === 'OK';
    }

    async unlink(alias: AliasAny): Promise<boolean> {
        if (!this.prop.enabled) {
            return false;
        }
        const aliasRec = this.format.alias(alias);
        if (!aliasRec.full) {
            return false;
        }
        return this.channel.basic.$secure.$unlink(aliasRec.full);
    }

    async unlinkMore(aliases: AliasAnyArray): Promise<number> {
        if (!this.prop.enabled) {
            return 0;
        }
        const aliasRec = this.format.aliases(aliases);
        if (aliasRec.fulls.length < 1) {
            return 0;
        }
        return this.channel.basic.$secure.$unlinkMore(aliasRec.fulls);
    }

    // endregion regular

    // region secure
    get $flat(): CacheAliasDef {
        return this as CacheAliasDef;
    }
    // endregion secure

}