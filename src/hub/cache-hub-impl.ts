import {CacheClient, CacheClientCreatorLambda} from "../client";
import {CacheHub, CacheHubInfo, CacheHubProp, CacheHubPropData, CacheHubPropLambda, CacheHubSecure} from "./types";
import {CacheSegment, CacheSegmentCreatorLambda, CacheSegmentPropData, CacheSegmentPropLambda} from "../segment";
import {CacheEntity, CacheEntityCreatorLambda, CacheEntityDef} from "../entity";
import {CacheChannelCreatorLambda} from "../channel";
import {Builder} from "@leyyo/builder";
import {CacheHubPropImpl} from "./cache-hub-prop-impl";
import {CacheInfoCheck, Id, TR} from "../types";
import {CacheProvider} from "../provider";
import {cacheUtil} from "../util";
import {CacheRemote, CacheRemoteImpl} from "../remote";
import {CacheInvalidatorConsumer} from "../invalidator";

export class CacheHubImpl implements CacheHub, CacheHubSecure {
    private readonly _segmentCreators: Map<CacheProvider, CacheSegmentCreatorLambda>;
    private readonly _entityCreators: Map<CacheProvider, CacheEntityCreatorLambda<TR>>;
    private readonly _channelCreators: Map<CacheProvider, CacheChannelCreatorLambda<TR, Id>>;
    private readonly _clientCreators: Map<CacheProvider, CacheClientCreatorLambda>;
    private readonly _segmentMap: Map<string, CacheSegment>;
    private readonly _entityMap: Map<string, CacheEntityDef>;
    private readonly _invalidatorConsumerMap: Map<string, CacheInvalidatorConsumer>;

    private readonly _segments: Array<CacheSegment>;
    private readonly _providers: Array<CacheProvider>;
    private readonly _clients: Array<CacheClient>;
    private readonly _defaults: CacheHubPropData = {
        enabled: false,
        property: null,
        saveMode: 'always',
        saveSpan: 'ttl',
        expiryMode: 'always',
        expirySpan: 'ttl',
        milliseconds: 24 * 60 * 60 * 1_000,
        expiryUnit: 'seconds',
    };
    readonly prop: Readonly<CacheHubProp>;

    constructor() {
        this._segmentCreators = new Map();
        this._entityCreators = new Map();
        this._channelCreators = new Map();
        this._clientCreators = new Map();

        this._segmentMap = new Map();
        this._entityMap = new Map();
        this._invalidatorConsumerMap = new Map();

        this._segments = [];
        this._providers = [];
        this._clients = [];
        this.prop = new CacheHubPropImpl(this._defaults, {} as CacheHubPropData);
    }

    get segments(): Array<CacheSegment> {
        return [...this._segments]; // return cloned
    }

    get clients(): Array<CacheClient> {
        return [...this._clients]; // return cloned
    }

    get providers(): Array<CacheProvider> {
        return [...this._providers]; // return cloned
    }

    registerClient(provider: CacheProvider, native: unknown, description?: string): CacheClient {
        if (typeof description === 'string') {
            description = description.trim();
            if (!description) {
                description = null;
            }
        } else if (![null, undefined].includes(description)) {
            console.log(`Invalid description!, info: ${cacheUtil.objectInfo(description)} in hub.registerClient`);
            description = null;
        } else {
            description = null;
        }
        cacheUtil.checkObject('hub.registerClient', 'provider', provider, 'leyyo.cache,CacheProvider');
        if (!native || typeof native !== 'object' || Array.isArray(native)) {
            cacheUtil.checkObject('hub.registerClient', 'native', native, 'leyyo.cache,Unknown');
        }
        const lambda = this.$getClientCreator(provider);
        const client = lambda(native, description) as CacheClient;
        if (!this._clients.includes(client)) {
            this._clients.push(client);
        }
        if (!this._providers.includes(provider)) {
            this._providers.push(provider);
        }
        if (!provider.defaultClient) {
            provider.$secure.$setDefaultClient(client);
        }
        return client;
    }

    newSegment(client: CacheClient, path: string, fn: CacheSegmentPropLambda, id?: string): CacheSegment {
        id = cacheUtil.checkName('hub.newSegment', 'id', id, true);
        path = cacheUtil.checkName('hub.newSegment', 'path', path, true);
        cacheUtil.checkObject('hub.newSegment', 'client', client, 'leyyo.cache,CacheClient');
        cacheUtil.checkLambda('hub.newSegment', 'lambda', fn, 1);

        const prop = Builder.retrieve(fn) as CacheSegmentPropData;
        const lambda = this.$getSegmentCreator(client.provider);
        const segment = lambda(client, path, prop, id) as CacheSegment;
        this._segments.push(segment);
        return segment;
    }

    newRemote(id: string): CacheRemote {
        id = cacheUtil.checkName('hub.newSegment', 'id', id, false);
        const ins = new CacheRemoteImpl(id);
        this.$checkInvalidatorConsumer(ins);
        return ins;
    }

    async info(check: CacheInfoCheck): Promise<CacheHubInfo> {
        const promises = this._segments.map(c => c.info(check));
        return {
            prop: this.prop.$secure.$pure,
            defaults: this._defaults,
            segments: await Promise.all(promises),
        };
    }

    changeProp(lambda: CacheHubPropLambda): void {
        this.$setProp(cacheUtil.readProp(lambda(Builder.build<CacheHubPropData>())));
    }

    getInvalidatorConsumer(id: string): CacheInvalidatorConsumer {
        if (!id || typeof id !== 'string') {
            // todo
            return null;
        }
        const consumer = this._invalidatorConsumerMap.get(id);
        if (!consumer) {
            // todo
            return null;
        }
        return consumer;
    }

    getEntity<A extends TR = TR>(id: string): CacheEntity<A> {
        if (!id || typeof id !== 'string') {
            return null;
        }
        return this._entityMap.get(id) as CacheEntity<A>;
    }

    getSegment(id: string): CacheSegment {
        if (!id || typeof id !== 'string') {
            return null;
        }
        return this._segmentMap.get(id) as CacheSegment;
    }


    // region secure
    get $secure(): CacheHubSecure {
        return this;
    }

    get $back(): CacheHub {
        return this;
    }

    $getSegmentCreator(provider: CacheProvider): CacheSegmentCreatorLambda {
        cacheUtil.checkObject('hub.$getSegmentCreator', 'provider', provider, 'leyyo.cache,CacheProvider');
        if (!this._segmentCreators.has(provider)) {
            throw new Error(`Not found segment for provider: ${provider.name} in hub.$getSegmentCreator`);
        }
        return this._segmentCreators.get(provider);
    }

    $setSegmentCreator(provider: CacheProvider, lambda: CacheSegmentCreatorLambda): void {
        cacheUtil.checkObject('hub.$setSegmentCreator', 'provider', provider, 'leyyo.cache,CacheProvider');
        if (this._segmentCreators.has(provider)) {
            throw new Error(`Duplicated segment for provider: ${provider.name} in hub.$setSegmentCreator`);
        }
        cacheUtil.checkLambda('hub.$setSegmentCreator', 'lambda', lambda, 4);
        this._segmentCreators.set(provider, lambda);
    }

    $getEntityCreator(provider: CacheProvider): CacheEntityCreatorLambda<TR> {
        cacheUtil.checkObject('hub.$getEntityCreator', 'provider', provider, 'leyyo.cache,CacheProvider');
        if (!this._entityCreators.has(provider)) {
            throw new Error(`Not found entity for provider: ${provider.name} in hub.$getEntityCreator`);
        }
        return this._entityCreators.get(provider);
    }

    $setEntityCreator(provider: CacheProvider, lambda: CacheEntityCreatorLambda<TR>): void {
        cacheUtil.checkObject('hub.$setEntityCreator', 'provider', provider, 'leyyo.cache,CacheProvider');
        if (this._entityCreators.has(provider)) {
            throw new Error(`Duplicated entity for provider: ${provider.name} in hub.$setEntityCreator`);
        }
        cacheUtil.checkLambda('hub.$setEntityCreator', 'lambda', lambda, 4);
        this._entityCreators.set(provider, lambda);
    }

    $getChannelCreator(provider: CacheProvider): CacheChannelCreatorLambda<TR, Id> {
        cacheUtil.checkObject('hub.$getChannelCreator', 'provider', provider, 'leyyo.cache,CacheProvider');
        if (!this._channelCreators.has(provider)) {
            throw new Error(`Not found channel for provider: ${provider.name} in hub.$getChannelCreator`);
        }
        return this._channelCreators.get(provider);
    }

    $setChannelCreator(provider: CacheProvider, lambda: CacheChannelCreatorLambda<TR, Id>): void {
        cacheUtil.checkObject('hub.$setChannelCreator', 'provider', provider, 'leyyo.cache,CacheProvider');
        if (this._channelCreators.has(provider)) {
            throw new Error(`Duplicated channel for provider: ${provider.name} in hub.$setChannelCreator`);
        }
        cacheUtil.checkLambda('hub.$setChannelCreator', 'lambda', lambda, 4);
        this._channelCreators.set(provider, lambda);
    }

    $getClientCreator(provider: CacheProvider): CacheClientCreatorLambda {
        cacheUtil.checkObject('hub.$getClientCreator', 'provider', provider, 'leyyo.cache,CacheProvider');
        if (!this._clientCreators.has(provider)) {
            throw new Error(`Not found client for provider: ${provider.name} in hub.$getClientCreator`);
        }
        return this._clientCreators.get(provider);
    }

    $setClientCreator(provider: CacheProvider, lambda: CacheClientCreatorLambda): void {
        cacheUtil.checkObject('hub.$setClientCreator', 'provider', provider, 'leyyo.cache,CacheProvider');
        if (this._clientCreators.has(provider)) {
            throw new Error(`Duplicated client for provider: ${provider.name} in hub.$setClientCreator`);
        }
        cacheUtil.checkLambda('hub.$setClientCreator', 'lambda', lambda, 4);
        this._clientCreators.set(provider, lambda);
    }

    $setProp(prop: CacheHubPropData): void {
        this.prop.$secure.$setPure(prop);
        this._segments.forEach(segment => segment.$secure.$setProp(prop));
    }
    $checkInvalidatorConsumer(consumer: CacheInvalidatorConsumer): void {
        cacheUtil.checkName('hub.$checkInvalidatorConsumer', 'id', consumer.id, false);
        if (this._invalidatorConsumerMap.has(consumer.id)) {
            throw new Error(`Id of remote was already used by another invalidator consumer: ${consumer.id}`);
        }
        this._invalidatorConsumerMap.set(consumer.id, consumer);
    }

    $checkEntity(entity: CacheEntityDef): void {
        if (!entity.id) {
            return;
        }
        if (this._entityMap.has(entity.id)) {
            throw new Error(`Entity is duplicated! id: ${entity.id}`)
        }
        this._entityMap.set(entity.id, entity);
    }

    $checkSegment(segment: CacheSegment): void {
        if (!segment.id) {
            return;
        }
        if (this._segmentMap.has(segment.id)) {
            throw new Error(`Segment is duplicated! id: ${segment.id}`)
        }
        this._segmentMap.set(segment.id, segment);
    }

    // endregion secure
}