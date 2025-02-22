import {CacheChannelCreatorLambda, CacheHub} from "./types";
import {CacheChannel, CacheID, TR} from "../channel";
import {CachePropCompleted} from "../prop";
import {CacheClientLike} from "../client";

class CacheHubImpl implements CacheHub{
    private _channelCreators: Map<string, CacheChannelCreatorLambda<TR, string, unknown>>;

    constructor() {
        this._channelCreators = new Map();
    }

    setChannelCreator<A extends TR = TR, N extends CacheID = string, C = unknown>(provider: string, lambda: CacheChannelCreatorLambda<A, N, C>): void {
        this._channelCreators.set(provider, lambda as CacheChannelCreatorLambda<TR, string, unknown>);
    }
    createChannel<A extends TR, N extends CacheID = string, C = unknown>(client: CacheClientLike<C>, prop: CachePropCompleted<A>): CacheChannel<A, N, C> {
        const lambda = this._channelCreators.get(client?.provider);
        if (!lambda) {
            throw new Error('Invalid provider'); // todo
        }
        return lambda(client, prop as CachePropCompleted<TR>) as CacheChannel<A, N, C>;
    }
}
export const cacheHub: CacheHub = new CacheHubImpl();