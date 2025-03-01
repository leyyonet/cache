import {CacheClient} from "../client";
import {
    CacheSegment,
    CacheSegmentInfo,
    CacheSegmentProp,
    CacheSegmentPropData,
    CacheSegmentPropLambda,
    CacheSegmentSecure
} from "./types";
import {CacheSegmentPropImpl} from "./cache-segment-prop-impl";
import {CacheEntity, CacheEntityDef, CacheEntityPropDataDef, CacheEntityPropLambda} from "../entity";
import {cacheHub} from "../hub";
import {Builder} from "@leyyo/builder";
import {CacheInfoCheck, TR} from "../types";
import {cacheUtil} from "../util";

// noinspection JSUnusedGlobalSymbols
export class CacheSegmentAbstract implements CacheSegment, CacheSegmentSecure {

    // region properties
    private readonly _entities: Array<CacheEntityDef>;

    readonly path: string; // from client
    readonly id: string;
    readonly defaultClient: CacheClient; // from client
    readonly prop: Readonly<CacheSegmentProp>;
    // endregion properties

    // region constructor
    constructor(defaultClient: CacheClient, path: string, prop: CacheSegmentPropData, id: string) {
        this._entities = [];
        this.defaultClient = defaultClient;
        this.path = path;
        this.id = id;
        this.prop = new CacheSegmentPropImpl(prop, cacheHub.prop);
        cacheHub.$secure.$checkSegment(this);
    }

    // endregion constructor

    get entities(): Array<CacheEntityDef> {
        return [...this._entities];
    }

    newEntity<A extends TR>(path: string, fn: CacheEntityPropLambda<A>, id?: string, differentClient?: CacheClient): CacheEntity<A> {
        id = cacheUtil.checkName('segment.newEntity', 'id', id, true);
        path = cacheUtil.checkName('segment.newSegment', 'path', path, true);

        if (differentClient !== undefined) {
            cacheUtil.checkObject('segment.newEntity', 'client', differentClient, 'leyyo.cache,CacheClient');
        } else {
            differentClient = this.defaultClient;
        }
        cacheUtil.checkLambda('segment.newEntity', 'lambda', fn, 1);

        const prop = Builder.retrieve(fn) as CacheEntityPropDataDef;
        const lambda = cacheHub.$secure.$getEntityCreator(differentClient.provider);
        const entity = lambda(this, path, prop, id, differentClient) as CacheEntity<A>;
        this._entities.push(entity.$flat);
        return entity;
    }

    async info(check: CacheInfoCheck): Promise<CacheSegmentInfo> {
        const promises = this._entities.map(c => c.info(check));
        return {
            id: this.id ?? undefined,
            path: this.path ?? undefined,
            defaultClient: await this.defaultClient.info(check),
            prop: this.prop.$secure.$pure,
            entities: await Promise.all(promises),
        };
    }

    changeProp(lambda: CacheSegmentPropLambda): void {
        this.$setProp(cacheUtil.readProp(lambda(Builder.build<CacheSegmentPropData>())));
    }

    // region secure

    get $secure(): CacheSegmentSecure {
        return this;
    }

    get $back(): CacheSegment {
        return this;
    }

    $setProp(prop: CacheSegmentPropData): void {
        this.prop.$secure.$setPure(prop);
        this._entities.forEach(entity => entity.$secure.$setProp(prop as CacheEntityPropDataDef));
    }

    // endregion secure

}