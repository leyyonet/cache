export interface CacheClientLike<C> {
    readonly provider: string;
    readonly native: C;

    get flattenGeneric$(): CacheClientLikeDef;
}

export type CacheClientLikeDef = CacheClientLike<unknown>;