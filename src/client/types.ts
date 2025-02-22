export interface CacheClientLike<C> {
    readonly provider: string;
    readonly native: C;
}