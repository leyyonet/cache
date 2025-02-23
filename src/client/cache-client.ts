import {CacheClientLike, CacheClientLikeDef} from "./types";

export class CacheClient<C> implements CacheClientLike<C> {
    readonly provider: string;
    readonly native: C;

    constructor(native: C, provider?: string) {
        this.native = native;
        if (!provider && native && typeof native === 'object') {
            provider = native.constructor.name;
        }
        this.provider = provider;
    }

    get flattenGeneric$(): CacheClientLikeDef {
        return this;
    }
}