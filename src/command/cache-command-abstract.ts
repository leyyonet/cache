import {CacheChannel, CacheChannelPropData} from "../channel";
import {CacheClient} from "../client";
import {CacheUtil} from "../util";
import {Id, TR} from "../types";
import {CacheFormat} from "../format";

// noinspection JSUnusedGlobalSymbols
export abstract class CacheCommandAbstract<A extends TR, N extends Id> {
    protected readonly channel: CacheChannel<A, N>;
    protected readonly client: CacheClient;
    protected readonly util: CacheUtil;
    protected readonly prop: Readonly<CacheChannelPropData<A>>;
    protected readonly format: CacheFormat<A, N>;

    protected constructor(channel: CacheChannel<A, N>) {
        this.channel = channel;
        this.client = channel.client as CacheClient;
        this.util = channel.util;
        this.prop = channel.prop;
        this.format = channel.format;
    }


}