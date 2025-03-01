import {CacheClient} from "../client";
import {
    CacheEntity,
    CacheEntityDef,
    CacheEntityInfo,
    CacheEntityProp,
    CacheEntityPropData,
    CacheEntityPropLambda,
    CacheEntitySecure
} from "./types";
import {CacheEntityPropImpl} from "./cache-entity-prop-impl";
import {CacheSegment} from "../segment";
import {CacheChannel, CacheChannelDef, CacheChannelPropData, CacheChannelPropLambda} from "../channel";
import {Builder} from "@leyyo/builder";
import {cacheHub} from "../hub";
import {CacheInfoCheck, Id, TR} from "../types";
import {cacheUtil} from "../util";

// noinspection JSUnusedGlobalSymbols
export abstract class CacheEntityAbstract<A extends TR> implements CacheEntity<A>, CacheEntitySecure<A> {

    // region properties
    protected readonly _channels: Array<CacheChannelDef>;
    readonly path: string;
    readonly id: string;
    readonly segment: CacheSegment; // from child
    readonly defaultClient: CacheClient; // from child
    readonly prop: Readonly<CacheEntityProp<A>>;
    // endregion properties

    // region constructor
    protected constructor(segment: CacheSegment, path: string, prop: CacheEntityPropData<A>, id: string, defaultClient: CacheClient) {
        this._channels = [];
        this.path = path;
        this.id = id;
        this.segment = segment;
        this.defaultClient = defaultClient;
        this.prop = new CacheEntityPropImpl(prop, segment.prop);
        cacheHub.$secure.$checkEntity(this.$flat);
    }

    // endregion constructor

    get channels(): Array<CacheChannel<A, Id>> {
        return [...this._channels] as Array<CacheChannel<A, Id>>;
    }

    newChannel<B extends TR = A, N extends Id = Id>(path: string, fn: CacheChannelPropLambda<B>, id?: string, differentClient?: CacheClient): CacheChannel<B, N> {
        path = cacheUtil.checkName('entity.newChannel', 'path', path, true);
        id = cacheUtil.checkName('entity.newChannel', 'id', id, true);
        if (differentClient !== undefined) {
            cacheUtil.checkObject('entity.newChannel', 'client', differentClient, 'leyyo.cache,CacheClient');
        } else {
            differentClient = this.defaultClient;
        }
        cacheUtil.checkLambda('entity.newChannel', 'lambda', fn, 1);
        const prop = cacheUtil.readProp(fn(Builder.build<CacheChannelPropData<B>>()));
        const lambda = cacheHub.$secure.$getChannelCreator(differentClient.provider);
        const channel = lambda(this.$flat, path, prop as CacheChannelPropData<TR>, id, differentClient) as CacheChannel<B, N>;
        this._channels.push(channel.$flat);
        return channel;
    }

    async info(check: CacheInfoCheck): Promise<CacheEntityInfo> {
        const promises = this._channels.map(c => c.info(check));
        return {
            id: this.id ? this.id : undefined,
            path: this.path ? this.path : undefined,
            defaultClient: await this.defaultClient.info(check),
            prop: this.prop.$secure.$pure as Partial<CacheEntityPropData<TR>>,
            channels: await Promise.all(promises),
        };
    }


    changeProp(lambda: CacheEntityPropLambda<A>): void {
        this.$setProp(cacheUtil.readProp(lambda(Builder.build<CacheEntityPropData<A>>())));
    }

    // region secure
    get $flat(): CacheEntityDef {
        return this as CacheEntityDef;
    }

    get $secure(): CacheEntitySecure<A> {
        return this;
    }

    get $back(): CacheEntity<A> {
        return this;
    }

    $setProp(prop: Partial<CacheEntityPropData<A>>): void {
        this.prop.$secure.$setPure(prop);
        this._channels.forEach(channel => (channel as CacheChannel<A, Id>).$secure.$setProp(prop));
    }

    // endregion secure


}