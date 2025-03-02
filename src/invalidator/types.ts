import {IdAny, IdAnyArray, OneOrMore, TR} from "../types";
import {CacheChannelDef} from "../channel";
import {ShiftMain, ShiftSecure} from "../secure";

export interface CacheInvalidator<A extends TR> extends ShiftSecure<CacheInvalidatorSecure<A>> {
    success<T>(result: T, keys?: Array<string>, command?: string): CacheInvalidatorResult<A, T>;

    failed<T>(error: string | Error, keys?: Array<string>, command?: string): CacheInvalidatorResult<A, T>;

    ignoreZero<N extends number = number>(error?: string | Error, command?: string): CacheInvalidatorResult<A, N>;

    ignoreNull<T>(error?: string | Error, command?: string): CacheInvalidatorResult<A, T>;

    ignoreArray<T>(error?: string | Error, command?: string): CacheInvalidatorResult<A, Array<T>>;

    ignoreRecord<R>(error?: string | Error, command?: string): CacheInvalidatorResult<A, Record<string, R>>;

    ignoreTrue(error?: string | Error, command?: string): CacheInvalidatorResult<A, boolean>;

    ignoreFalse(error?: string | Error, command?: string): CacheInvalidatorResult<A, boolean>;
    ignoreText(error?: string | Error, command?: string): CacheInvalidatorResult<A, string>;

    disabledZero<N extends number = number>(): CacheInvalidatorResult<A, N>;

    disabledNull<T>(): CacheInvalidatorResult<A, T>;

    disabledArray<R>(): CacheInvalidatorResult<A, Array<R>>;

    disabledRecord<T>(): CacheInvalidatorResult<A, Record<string, T>>;

    disabledTrue(): CacheInvalidatorResult<A, boolean>;

    disabledFalse(): CacheInvalidatorResult<A, boolean>;
    disabledText(): CacheInvalidatorResult<A, string>;
}

export interface CacheInvalidatorSecure<A extends TR> extends ShiftMain<CacheInvalidator<A>> {
}

export interface CacheInvalidatorFromSelf<A extends TR> {
    resource: 'self',
    property?: OneOrMore<keyof A | string>, // use from options
}

export interface CacheInvalidatorFromChannel<A extends TR> {
    resource: 'consumer',
    property: OneOrMore<keyof A | string>,
    consumer: CacheInvalidatorConsumer,
}

export interface CacheInvalidatorFromChannelId<A extends TR> {
    resource: 'consumerId',
    property: OneOrMore<keyof A | string>,
    consumerId: string,
}

export type CacheInvalidatorFrom<A extends TR> =
    CacheInvalidatorFromSelf<A>
    | CacheInvalidatorFromChannel<A>
    | CacheInvalidatorFromChannelId<A>;

export interface CacheInvalidatorResult<A extends TR, T> {
    readonly keys: Array<string>,
    readonly disabled?: boolean;
    readonly error?: string | Error;
    readonly success?: boolean;
    readonly result?: T;
    readonly command?: string;

    add(id: IdAny): CacheInvalidatorResult<A, T>;

    add(id: IdAny, channel: CacheChannelDef): CacheInvalidatorResult<A, T>;

    add(id: IdAny, channelId: string): CacheInvalidatorResult<A, T>;

    addMore(ids: IdAnyArray, channel: CacheChannelDef): CacheInvalidatorResult<A, T>;

    addMore(ids: IdAnyArray, channelId: string): CacheInvalidatorResult<A, T>;

    addFromRelations(doc: Partial<A>, relations?: OneOrMore<CacheInvalidatorFrom<A>>): CacheInvalidatorResult<A, T>;

    delete(id: IdAny): CacheInvalidatorResult<A, T>;

    deleteMore(ids: IdAnyArray): CacheInvalidatorResult<A, T>;
    reset(value: T): CacheInvalidatorResult<A, T>;
}

export interface CacheInvalidatorRepo {
    notify(dataOwner: string, dataFullKey: string, idOwner: string, idBasicKeys: Array<string>): void;

    invalidate(idOwner: string, idFullKey: string): void;
}

// Record<idBasicKey, Record<dataFullKey, dataOwner>>
export type CacheInvalidatorNotifyRecords = Record<string, Record<string, string>>;

export interface CacheInvalidatorNotifyRequest {
    from?: string;
    records: CacheInvalidatorNotifyRecords;
}

// Array<basicKeys>
export type CacheInvalidatorInvalidateIds = Array<string>;

export interface CacheInvalidatorInvalidateRequest {
    from?: string;
    ids: CacheInvalidatorInvalidateIds;
}

export interface CacheInvalidatorDeleteRequest {
    from?: string;
    ids: Array<string>; // full keys
}

export interface CacheInvalidatorConsumer {
    readonly id: string;

    $invalidatorForNotify(data: CacheInvalidatorNotifyRequest): void;

    $invalidatorForInvalidate(data: CacheInvalidatorInvalidateRequest): void;

    $invalidatorForDelete(data: CacheInvalidatorDeleteRequest): void;
}

// todo leyyo
export type Mutable<A = Record<string, unknown>> = {
    -readonly [K in keyof A]: A[K];
}