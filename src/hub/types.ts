import {CacheChannel, CacheID, TR} from "../channel";
import {CacheClientLike} from "../client";
import {CachePropCompleted} from "../prop";

export type CacheChannelCreatorLambda<A extends TR, N extends CacheID, C> = (client: CacheClientLike<C>, prop: CachePropCompleted<A>) => CacheChannel<A, N, C>;
export interface CacheHub {
    setChannelCreator<A extends TR = TR, N extends CacheID = string, C = unknown>(provider: string, lambda: CacheChannelCreatorLambda<A, N, C>): void;
    createChannel<A extends TR = TR, N extends CacheID = string, C = unknown>(client: CacheClientLike<C>, prop: CachePropCompleted<A>): CacheChannel<A, N, C>;
}
