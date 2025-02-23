import {CacheBaseAbstract} from "../base";
import {CacheSet, CacheSetDef, CacheSetMembers} from "./types";
import {CacheInvalidator} from "../invalidator";
import {CacheID, CacheKey, TR} from "../channel";

export abstract class CacheSetAbstract<A extends TR, N extends CacheID, C> extends CacheBaseAbstract<A, N, C> implements CacheSet<A, N, C> {

    protected _checkMember(member: CacheID): string {
        return this.util.asKey(member);
    }
    protected _checkMembers(members: Array<N>): CacheSetMembers {
        if (!Array.isArray(members) || members.length < 1) {
            return {items: []};
        }
        const items = members
            .map(m => this._checkMember(m))
            .filter(m => m !== null)
            .filter((m, index, array) => array.indexOf(m) === index);
        return {items, duplicated: members.length > items.length};
    }
    get flattenGeneric$(): CacheSetDef {
        return this as CacheSetDef;
    }
    // region add
    abstract add(key: CacheKey<A>, members: Array<N>): Promise<CacheInvalidator<A, N, C, number>>;
    // endregion add

    // region remove
    abstract remove(key: CacheKey<A>, members: Array<N>): Promise<CacheInvalidator<A, N, C, number>>;
    // endregion remove

    // region members
    abstract members(key: CacheKey<A>): Promise<Array<string>>;
    abstract length(key: CacheKey<A>): Promise<number>;
    // endregion members

    // region exists
    abstract isMember(key: CacheKey<A>, member: N): Promise<boolean>;
    abstract areMembers(key: CacheKey<A>, members: Array<N>): Promise<Record<string, boolean>>;
    // endregion exists

}