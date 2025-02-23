import {CacheChannelCreatorLambda, CacheClientResult, CacheHub, CacheHubChannelItem, CacheHubClientRepo} from "./types";
import {CacheChannel, CacheID, TR} from "../channel";
import {CachePropChannel, CachePropCompleted} from "../prop";
import {CacheClient, CacheClientLike} from "../client";

class CacheHubImpl implements CacheHub{
    private _providers: Map<string, CacheChannelCreatorLambda<TR, string, unknown>>;
    private _clients: Map<Object, CacheHubClientRepo<TR, string, unknown>>;

    constructor() {
        this._providers = new Map();
        this._clients = new Map();
    }

    protected _getClient<A extends TR, N extends CacheID, C>(native: C, provider: string): CacheClientResult<A, N, C> {
        if (!provider) {
            throw new Error(`Empty client provider`);
        }
        if (!native) {
            throw new Error(`Empty client native connection for ${provider}`);
        }
        const lambda = this._providers.get(provider);
        if (!lambda) {
            const providers = this.listProviders();
            if (providers.length < 1) {
                throw new Error(`Invalid provider for ${provider}, there is not any available provider`);
            }
            throw new Error(`Invalid provider for ${provider}, available providers: ${providers}`);
        }
        let client: CacheClientLike<C>;
        let repo = this._clients.get(native);
        if (!repo) {
            client = new CacheClient<C>(native, provider);
            repo = {client, channels: []};
            this._clients.set(native, repo);
        }
        return {lambda, repo} as CacheClientResult<A, N, C>;
    }

    listProviders(): Array<string> {
        return Array.from(this._providers.keys());
    }
    listChannels(): Array<CacheHubChannelItem<TR>> {
        const arr = [] as Array<CacheHubChannelItem<TR>>;
        Array.from(this._clients.values()).forEach(repo => {
            const provider = repo.client.provider;
            repo.channels.forEach(channel => {
                const prop = channel.prop as CachePropChannel<TR>;
                arr.push({provider, ...prop});
            });
        });
        return arr;
    }

    getClient<C>(native: C, provider: string): CacheClientLike<C> {
        return this._getClient<TR, CacheID, C>(native, provider).repo.client;
    }
    setChannelCreator<A extends TR = TR, N extends CacheID = string, C = unknown>(provider: string, lambda: CacheChannelCreatorLambda<A, N, C>): void {
        if (this._providers.has(provider)) {
            throw new Error(`Duplicated provider for ${provider}`);
        }
        this._providers.set(provider, lambda as CacheChannelCreatorLambda<TR, string, unknown>);
    }
    createChannel<A extends TR, N extends CacheID = string, C = unknown>(client: CacheClientLike<C>, prop: CachePropCompleted<A>): CacheChannel<A, N, C> {
        if (!client) {
            throw new Error(`Empty client wrapper`);
        }
        const result = this._getClient<TR, CacheID, C>(client.native, client.provider);
        const index = result.repo.channels.findIndex(channel => channel.prop.prefix === prop.prefix);
        if (index >= 0) {
            console.warn(`Same prefix was used! ==> ${prop.prefix}`);
        }
        const channel = result.lambda(client, prop as CachePropCompleted<TR>) as CacheChannel<A, N, C>;
        result.repo.channels.push(channel as CacheChannel<TR, CacheID, C>);
        return channel;
    }
}
export const cacheHub: CacheHub = new CacheHubImpl();