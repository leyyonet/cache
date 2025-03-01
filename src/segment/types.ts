import {CacheClient, CacheClientInfo} from "../client";
import {CachePropSecure} from "../prop";
import {BuilderAny} from "@leyyo/builder/dist/types";
import {CacheEntity, CacheEntityDef, CacheEntityInfo, CacheEntityPropLambda} from "../entity";
import {CacheHubPropData} from "../hub";
import {CacheInfoCheck, TR} from "../types";
import {ShiftMain, ShiftSecure} from "../secure";

export interface CacheSegment extends ShiftSecure<CacheSegmentSecure> {
    // region properties
    readonly path: string;
    readonly id: string;
    readonly defaultClient: CacheClient; // from child
    readonly prop: Readonly<CacheSegmentProp>;

    // endregion properties

    get entities(): Array<CacheEntityDef>;

    newEntity<A extends TR>(path: string, fn: CacheEntityPropLambda<A>): CacheEntity<A>;

    newEntity<A extends TR>(path: string, fn: CacheEntityPropLambda<A>, id: string): CacheEntity<A>;

    newEntity<A extends TR>(path: string, fn: CacheEntityPropLambda<A>, id: string, differentClient: CacheClient): CacheEntity<A>;

    info(check: CacheInfoCheck): Promise<CacheSegmentInfo>;

    changeProp(lambda: CacheSegmentPropLambda): void;
}

export interface CacheSegmentSecure extends ShiftMain<CacheSegment> {
    $setProp(prop: Partial<CacheSegmentPropData>): void;
}

export type CacheSegmentPropData = CacheHubPropData;

export interface CacheSegmentProp extends CacheSegmentPropData, ShiftSecure<CacheSegmentPropSecure> {
}

export interface CacheSegmentPropSecure extends CachePropSecure, ShiftMain<CacheSegmentProp> {
    $setPure(pure: Partial<CacheSegmentPropData>): void;

    get $pure(): Partial<CacheSegmentPropData>;
}

export type CacheSegmentCreatorLambda = (defaultClient: CacheClient, path: string, prop: CacheSegmentPropData, id: string) => CacheSegment;
export type CacheSegmentPropLambda = (builder: BuilderAny<CacheSegmentPropData>) => BuilderAny<CacheSegmentPropData> | CacheSegmentPropData;

export interface CacheSegmentInfo {
    id?: string;
    path?: string;
    defaultClient: CacheClientInfo,
    prop: Partial<CacheSegmentPropData>;
    entities: Array<CacheEntityInfo>;
}
