import {CacheChannel, CacheID, TR} from "../channel";
import {CacheClientLike} from "../client";
import {CachePropChannel, CachePropCompleted, CachePropReadonly} from "../prop";

export type CacheChannelCreatorLambda<A extends TR, N extends CacheID, C> = (client: CacheClientLike<C>, prop: CachePropCompleted<A>) => CacheChannel<A, N, C>;
export interface CacheHub {
    listProviders(): Array<string>;
    listChannels(): Array<CacheHubChannelItem<TR>>;
    getClient<C>(native: C, provider: string): CacheClientLike<C>;
    setChannelCreator<A extends TR = TR, N extends CacheID = string, C = unknown>(provider: string, lambda: CacheChannelCreatorLambda<A, N, C>): void;
    createChannel<A extends TR = TR, N extends CacheID = string, C = unknown>(client: CacheClientLike<C>, prop: CachePropCompleted<A>): CacheChannel<A, N, C>;
}

export interface CacheHubClientRepo<A extends TR, N extends CacheID, C> {
    client: CacheClientLike<C>;
    channels: Array<CacheChannel<A, N, C>>;
}
export interface CacheHubChannelItem<A extends TR> extends CachePropChannel<A> {
    provider: string;
}
export interface CacheClientResult<A extends TR, N extends CacheID, C> {
    lambda: CacheChannelCreatorLambda<A, N, C>;
    repo: CacheHubClientRepo<A, N, C>;
}
