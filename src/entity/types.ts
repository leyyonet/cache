import {CacheClient, CacheClientInfo} from "../client";
import {CachePropSecure} from "../prop";
import {CacheChannel, CacheChannelInfo, CacheChannelPropLambda} from "../channel";
import {CacheSegment, CacheSegmentPropData} from "../segment";
import {BuilderAny} from "@leyyo/builder";
import {CacheInfoCheck, Id, OneOrMore, TR} from "../types";
import {ShiftMain, ShiftSecureFlat} from "../secure";

export interface CacheEntity<A extends TR> extends ShiftSecureFlat<CacheEntitySecure<A>, CacheEntityDef> {
    // region properties
    readonly path: string;
    readonly id: string;
    readonly segment: CacheSegment; // from child
    readonly defaultClient: CacheClient; // from child
    readonly prop: Readonly<CacheEntityProp<A>>;

    // endregion properties

    get channels(): Array<CacheChannel<A, Id>>;

    newChannel<B extends TR = A, N extends Id = Id>(path: string, fn: CacheChannelPropLambda<B>): CacheChannel<B, N>;

    newChannel<B extends TR = A, N extends Id = Id>(path: string, fn: CacheChannelPropLambda<B>, id: string): CacheChannel<B, N>;

    newChannel<B extends TR = A, N extends Id = Id>(path: string, fn: CacheChannelPropLambda<B>, id: string, differentClient: CacheClient): CacheChannel<B, N>;

    info(check: CacheInfoCheck): Promise<CacheEntityInfo>;

    changeProp(lambda: CacheEntityPropLambda<A>): void;
}

export interface CacheEntitySecure<A extends TR> extends ShiftMain<CacheEntity<A>> {
    $setProp(prop: Partial<CacheEntityPropData<A>>): void;
}

export type CacheEntityDef = CacheEntity<TR>;


export interface CacheEntityPropData<A extends TR> extends CacheSegmentPropData {
    property: OneOrMore<keyof A>;
}

export type CacheEntityPropDataDef = CacheEntityPropData<TR>;

export interface CacheEntityProp<A extends TR> extends CacheEntityPropData<A>, ShiftSecureFlat<CacheEntityPropSecure<A>, CacheEntityPropDef> {

}

export interface CacheEntityPropSecure<A extends TR> extends CachePropSecure, ShiftMain<CacheEntityProp<A>> {
    $setPure(pure: Partial<CacheEntityPropData<A>>): void;

    get $pure(): Partial<CacheEntityPropData<A>>;
}

export type CacheEntityPropDef = CacheEntityProp<TR>;

export type CacheEntityPropLambda<A extends TR> = (builder: BuilderAny<CacheEntityPropData<A>>) => BuilderAny<CacheEntityPropData<A>> | CacheEntityPropData<A>;
export type CacheEntityCreatorLambda<A extends TR> = (segment: CacheSegment, path: string, prop: CacheEntityPropData<A>, id: string, differentClient: CacheClient) => CacheEntity<A>;

export interface CacheEntityInfo {
    id?: string;
    path?: string;
    defaultClient: CacheClientInfo,
    prop: Partial<CacheEntityPropDataDef>;
    channels: Array<CacheChannelInfo>
}
