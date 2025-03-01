import {ExpiryMode, ExpirySpan, ExpiryUnit, SaveMode, SaveSpan} from "../literal";
import {CacheExpiryUnitTuple} from "../command";

export interface CachePropData {
    enabled: boolean;
    property: unknown;
    saveMode: SaveMode;
    saveSpan: SaveSpan;
    expiryMode: ExpiryMode;
    expirySpan: ExpirySpan;
    milliseconds: number;
    expiryUnit: ExpiryUnit;
}

export interface CachePropSecure {
    $expiryMode(mode: ExpiryMode): ExpiryMode;

    $expirySpan(span: ExpirySpan): ExpirySpan;

    $expiryUnit(unit: ExpiryUnit): ExpiryUnit;

    $ttl(tuple: CacheExpiryUnitTuple): number;

    $timestamp(tuple: CacheExpiryUnitTuple): number;

    $saveMode(mode: SaveMode): SaveMode;

    $saveSpan(span: SaveSpan): SaveSpan;
}

export type CachePropValidator = (value: unknown) => unknown;