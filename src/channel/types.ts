import {CacheClient, CacheClientInfo} from "../client";
import {CacheHash} from "../hash";
import {CacheBasic} from "../basic";
import {CacheSet} from "../set";
import {CacheInvalidator, CacheInvalidatorConsumer} from "../invalidator";
import {CacheUtil} from "../util";
import {CachePropSecure} from "../prop";
import {CacheEntity, CacheEntityPropData} from "../entity";
import {BuilderAny} from "@leyyo/builder";
import {CacheInfoCheck, Id, OneOrMore, TR} from "../types";
import {CacheFormat} from "../format";
import {ShiftMain, ShiftSecureFlat} from "../secure";
import {CacheAlias} from "../alias";

export interface CacheChannel<A extends TR, N extends Id> extends ShiftSecureFlat<CacheChannelSecure<A, N>, CacheChannelDef>, CacheInvalidatorConsumer {
    readonly path: string;
    readonly id: string;
    readonly entity: CacheEntity<A>; // from client
    readonly client: CacheClient; // from client
    readonly util: CacheUtil;
    readonly prop: Readonly<CacheChannelProp<A>>;
    readonly format: CacheFormat<A, N>; // from client
    readonly invalidator: CacheInvalidator<A>;

    get full(): string;

    get hash(): CacheHash<A, N>;

    get basic(): CacheBasic<A, N>;

    get set(): CacheSet<A, N>;

    get alias(): CacheAlias<A, N>;

    info(check: CacheInfoCheck): Promise<CacheChannelInfo>;

    changeProp(lambda: CacheChannelPropLambda<A>): void;

}

export interface CacheChannelSecure<A extends TR, N extends Id> extends ShiftMain<CacheChannel<A, N>> {
    $setFull(full: string): void;

    get $pNames(): Array<string>;

    $setProp(prop: Partial<CacheChannelPropData<A>>): void;
}

export type CacheChannelDef = CacheChannel<TR, Id>;


export interface CacheChannelPropData<A extends TR> extends CacheEntityPropData<A> {
    property: OneOrMore<keyof A>;
}

export interface CacheChannelProp<A extends TR> extends CacheChannelPropData<A>, ShiftSecureFlat<CacheChannelPropSecure<A>, CacheChannelPropDef> {
}

export interface CacheChannelPropSecure<A extends TR> extends CachePropSecure, ShiftMain<CacheChannelProp<A>> {
    $setPure(pure: Partial<CacheChannelPropData<A>>): void;

    get $pure(): Partial<CacheChannelPropData<A>>;
}

export type CacheChannelPropDef = CacheChannelProp<TR>;

export type CacheChannelPropLambda<A extends TR> = (builder: BuilderAny<CacheChannelPropData<A>>) => BuilderAny<CacheChannelPropData<A>> | CacheChannelPropData<A>;
export type CacheChannelCreatorLambda<A extends TR, N extends Id> = (entity: CacheEntity<A>, path: string, prop: CacheChannelPropData<A>, id: string, differentClient: CacheClient) => CacheChannel<A, N>;


export interface CacheChannelInfo {
    id?: string;
    path?: string;
    client: CacheClientInfo,
    prop: Partial<CacheChannelPropData<TR>>;
}
