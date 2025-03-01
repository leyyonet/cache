import {
    ExpiryMode,
    ExpiryModeItems,
    ExpirySpan,
    ExpirySpanItems,
    ExpiryUnit,
    ExpiryUnitItems,
    SaveMode,
    SaveModeItems,
    SaveSpan,
    SaveSpanItems
} from "../literal";
import {CachePropData, CachePropSecure, CachePropValidator} from "./types";
import {CacheExpiryUnitTuple} from "../command";

type D = CachePropData;

// noinspection DuplicatedCode,JSUnusedLocalSymbols
export abstract class CacheAbstractPropImpl implements CachePropData, CachePropSecure {
    protected _pure: Partial<D>;
    protected _validators: Map<string, CachePropValidator>;

    enabled: boolean;
    expiryMode: ExpiryMode;
    expirySpan: ExpirySpan;
    expiryUnit: ExpiryUnit;
    milliseconds: number;
    property: unknown;
    saveMode: SaveMode;
    saveSpan: SaveSpan;

    protected constructor(data: Partial<D>, parent: D, validators?: Map<string, CachePropValidator>) {
        this._pure = {};
        if (validators instanceof Map) {
            this._validators = validators;
        } else {
            this._validators = new Map();
        }
        this._init(data, parent);
    }

    // region internal

    private _init(pure: Partial<D>, parent: D) {
        if (parent && typeof parent === 'object' && !Array.isArray(parent)) {
            for (const [k, v] of Object.entries(parent)) {
                if (!["function", "symbol"].includes(typeof v)) {
                    this[k] = v;
                }
            }
        }
        this._setPure(pure);
    }

    protected _setPure(pure: Partial<D>) {
        for (const [k, v] of Object.entries(pure)) {
            if (!["function", "symbol"].includes(typeof v)) {
                this._pure[k] = v;
                this[k] = v;
            }
        }
        if (this._validators.size > 0) {
            for (const [k, fn] of this._validators.entries()) {
                if (!['undefined', 'function', 'symbol'].includes(typeof this[k])) {
                    this[k] = fn(this[k]);
                }
            }
        }
    }

    private _set(key: keyof D, value: D[keyof D], flag: boolean) {
        if (flag) {
            this._pure[key as string] = value;
            this[key as string] = value;
        } else {
            console.error(`Invalid prop value for ${key} as ${value}`);
        }
    }

    private _isNumber(value: number): boolean {
        return typeof value !== "number" || isNaN(value) || !isFinite(value);
    }

    // endregion internal

    // region secure

    $expiryMode(mode: ExpiryMode): ExpiryMode {
        return ExpiryModeItems.includes(mode) ? mode : this.expiryMode;
    }

    $expirySpan(span: ExpirySpan): ExpirySpan {
        return ExpirySpanItems.includes(span) ? span : this.expirySpan;
    }

    $expiryUnit(unit: ExpiryUnit): ExpiryUnit {
        return ExpiryUnitItems.includes(unit) ? unit : this.expiryUnit;
    }

    $saveMode(mode: SaveMode): SaveMode {
        return SaveModeItems.includes(mode) ? mode : this.saveMode;
    }

    $saveSpan(span: SaveSpan): SaveSpan {
        return SaveSpanItems.includes(span) ? span : this.saveSpan;
    }

    $ttl(tuple: CacheExpiryUnitTuple): number {
        const [value, unit] = tuple;
        const now = new Date().getTime();
        if (!tuple || !Array.isArray(tuple) || tuple.length < 1) {
            return now + this.milliseconds;
        }
        if (!this._isNumber(value) || value < 1) {
            return now + this.milliseconds;
        }
        switch (unit ?? this.expiryUnit) {
            case "milliseconds":
                return now + value;
            case "seconds":
                return now + (value * 1_000);
            default: // minutes
                return now + (value * 60_000);
        }
    }

    $timestamp(tuple: CacheExpiryUnitTuple): number {
        const [value, unit] = tuple;
        const now = new Date().getTime();
        if (!tuple || !Array.isArray(tuple) || tuple.length < 1) {
            return now + this.milliseconds;
        }
        if (!this._isNumber(value) || value < 1) {
            return now + this.milliseconds;
        }
        switch (unit ?? this.expiryUnit) {
            case "milliseconds":
                return value;
            case "seconds":
                return value * 1_000;
            default: // minutes
                return value * 60_000;
        }
    }

    // endregion secure

}


/*
*     setEnabled(value: boolean) {
        this._set('enabled', value, typeof value === 'boolean');
    }

    setExpiryMode(value: ExpiryMode) {
        this._set('expiryMode', value, ExpiryModeItems.includes(value));
    }

    setExpirySpan(value: ExpirySpan) {
        this._set('expirySpan', value, ExpirySpanItems.includes(value));
    }

    setExpiryUnit(value: ExpiryUnit) {
        this._set('expiryUnit', value, ExpiryUnitItems.includes(value));
    }

    setMilliseconds(value: number) {
        this._set('milliseconds', value, this._isNumber(value) && value > 0);
    }

    setSaveMode(value: SaveMode) {
        this._set('saveMode', value, SaveModeItems.includes(value));
    }

    setSaveSpan(value: SaveSpan) {
        this._set('saveSpan', value, SaveSpanItems.includes(value));
    }

* */