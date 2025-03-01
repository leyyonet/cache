import {Id, IdAny, IdAnyArray, OneOrMore, TR} from "../types";
import {CacheFieldValue} from "../hash";
import {ShiftMain, ShiftSecure} from "../secure";

export interface CacheFormat<A extends TR, N extends Id> extends ShiftSecure<CacheFormatSecure<A, N>> {

    checkName<A>(property: OneOrMore<string | keyof A>): Array<string>;

    key(key: IdAny): CacheFormatRec;

    keys(keys: IdAnyArray): CacheFormatRecs;

    basic(field: IdAny): string;

    basics(fields: IdAnyArray): Array<string>;

    alias(alias: IdAny): CacheFormatRec;

    aliases(aliases: IdAnyArray): CacheFormatRecs;

    owner(owner: IdAny): CacheFormatRec;

    owners(owners: IdAnyArray): CacheFormatRecs;

    invalidation(invalidation: IdAny): CacheFormatRec;

    invalidations(invalidations: IdAnyArray): CacheFormatRecs;

    field(field: IdAny): string;

    fields(fields: IdAnyArray): Array<string>;

    member(member: IdAny): string;

    members(members: IdAnyArray): Array<string>;

    memberShorts(members: IdAnyArray): CacheFormatBasics;

    value(value: CacheFieldValue<A>): CacheFieldValue<A>;

    valueDoc(value: Record<string, CacheFieldValue<A>>): Record<string, CacheFieldValue<A>>;
}

export interface CacheFormatSecure<A extends TR, N extends Id> extends ShiftMain<CacheFormat<A, N>> {
    $setChannelFull(): void;
}

export interface CacheFormatRec {
    short?: string;
    full?: string;
}

export interface CacheFormatRecs {
    shorts: Array<string>;
    fulls: Array<string>;
    duplicated?: boolean;
}

export interface CacheFormatBasics {
    shorts: Array<string>;
    duplicated?: boolean;
}