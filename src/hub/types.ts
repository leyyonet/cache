import {CacheChannelCreatorLambda} from "../channel";
import {CacheClient, CacheClientCreatorLambda} from "../client";
import {CacheEntity, CacheEntityCreatorLambda, CacheEntityDef} from "../entity";
import {CacheSegment, CacheSegmentCreatorLambda, CacheSegmentInfo, CacheSegmentPropLambda} from "../segment";
import {CachePropData, CachePropSecure} from "../prop";
import {CacheInfoCheck, Id, TR} from "../types";
import {CacheProvider} from "../provider";
import {BuilderAny} from "@leyyo/builder/dist/types";
import {ShiftMain, ShiftSecure} from "../secure";
import {CacheRemote} from "../remote";
import {CacheInvalidatorConsumer} from "../invalidator";

export interface CacheHub extends ShiftSecure<CacheHubSecure> {
    readonly prop: Readonly<CacheHubProp>;

    get segments(): Array<CacheSegment>;

    get clients(): Array<CacheClient>;

    get providers(): Array<CacheProvider>;

    registerClient(provider: CacheProvider, native: unknown): CacheClient;

    newSegment(client: CacheClient, path: string, fn: CacheSegmentPropLambda, id?: string): CacheSegment;

    newRemote(id: string): CacheRemote;

    info(check: CacheInfoCheck): Promise<CacheHubInfo>;

    changeProp(lambda: CacheHubPropLambda): void;

    getSegment(id: string): CacheSegment;

    getEntity<A extends TR = TR>(id: string): CacheEntity<A>;

    // returns channel or remote
    getInvalidatorConsumer(id: string): CacheInvalidatorConsumer;
}

export interface CacheHubSecure extends ShiftMain<CacheHub> {
    $setSegmentCreator(provider: CacheProvider, lambda: CacheSegmentCreatorLambda): void;

    $getSegmentCreator(provider: CacheProvider): CacheSegmentCreatorLambda;

    $setEntityCreator(provider: CacheProvider, lambda: CacheEntityCreatorLambda<TR>): void;

    $getEntityCreator(provider: CacheProvider): CacheEntityCreatorLambda<TR>;

    $setChannelCreator(provider: CacheProvider, lambda: CacheChannelCreatorLambda<TR, Id>): void;

    $getChannelCreator(provider: CacheProvider): CacheChannelCreatorLambda<TR, Id>;

    $setClientCreator(provider: CacheProvider, lambda: CacheClientCreatorLambda): void;

    $getClientCreator(provider: CacheProvider): CacheClientCreatorLambda;

    $setProp(prop: CacheHubPropData): void;

    $checkSegment(segment: CacheSegment): void;

    $checkEntity(entity: CacheEntityDef): void;
    $checkInvalidatorConsumer(consumer: CacheInvalidatorConsumer): void;
}

export type CacheHubPropData = CachePropData;

export interface CacheHubProp extends CacheHubPropData, ShiftSecure<CacheHubPropSecure> {

}

export interface CacheHubPropSecure extends ShiftMain<CacheHubProp>, CachePropSecure {
    $setPure(pure: Partial<CacheHubPropData>): void;

    get $pure(): Partial<CacheHubPropData>;
}


export type CacheHubPropLambda = (builder: BuilderAny<CacheHubPropData>) => BuilderAny<CacheHubPropData> | CacheHubPropData;

export interface CacheHubInfo {
    segments: Array<CacheSegmentInfo>;
    prop: Partial<CacheHubPropData>;
    defaults: Partial<CacheHubPropData>;
}
