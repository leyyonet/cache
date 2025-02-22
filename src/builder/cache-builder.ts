import {Builder, BuilderAny} from "@leyyo/builder";
import {CacheDefaults} from "./cache-defaults";
import {CachePropChannel, CachePropCompleted} from "../prop";
import {CacheChannel, CacheID, TR} from "../channel";
import {cacheHub} from "../hub";
import {CacheClientLike} from "../client";
import {CacheOptExpiryUnitType} from "../command";

// noinspection JSUnusedLocalSymbols
export class CacheBuilder {
    private static _globalFetched: boolean = false;
    private static _defaults: CachePropChannel<TR> = {
        prefix: null,
        enabled: null,
        property: null,
        expirySave: 'after',
        expirySet: 'after',
        expiryMode: 'always',
        expiryUnit: 'seconds',
        expiryValue: 0,
        setMode: 'always',
        incrementData: 'integer',
        incrementDir: 'increment',
        incrementValue: 1,
    };

    private constructor() {
        throw new Error('No instantiation for this class')
    }

    static build<A extends TR = TR, N extends CacheID = string, C = unknown>(client: CacheClientLike<C>, prop?: BuilderAny<CachePropChannel<A>> | CachePropChannel<A>): CacheChannel<A, N, C> {
        let cloned: CachePropCompleted<A>;
        if (!prop) {
            cloned = {...this._defaults} as CachePropCompleted<A>;
        }
        else {
            if (typeof (prop as BuilderAny<CachePropChannel<A>>).$finalize === 'function') {
                (prop as BuilderAny<CachePropChannel<A>>).$finalize();
            }
            cloned = {...(prop as CachePropCompleted<A>)};
        }
        if (!client && cloned.enabled) {
            throw new Error('Cache client can not be empty for enabled case!');
        }
        if (!cloned.prefix) {
            cloned.prefix += '^';
        }
        else {
            cloned.prefix = '';
        }
        cloned.disable = function (): void {
            (this as CachePropCompleted<A>).enabled = false;
        }
        cloned.enable = function (): void {
            (this as CachePropCompleted<A>).enabled = true;
        }
        cloned.expiryAs = function (given: CacheOptExpiryUnitType): number {
            const self = (this as CachePropCompleted<A>);
            const unit = self.expiryUnit;
            if (given === unit) {
                return self.expiryValue;
            }
            switch (given) {
                case "seconds":
                    return self.expiryAsSeconds();
                case "milliseconds":
                    return self.expiryAsMilliseconds();
                case "minutes":
                    return self.expiryAsMinutes();
                default:
                    return self.expiryValue;
            }
        }
        cloned.expiryAsSeconds = function (): number {
            const self = (this as CachePropCompleted<A>);
            const unit = self.expiryUnit;
            const value = self.expiryValue;
            switch (unit) {
                case "seconds":
                    return value;
                case "milliseconds":
                    return Math.floor(value / 1_000);
                case "minutes":
                    return value * 1_000;
                default:
                    return value;
            }
        }
        cloned.expiryAsMilliseconds = function (): number {
            const self = (this as CachePropCompleted<A>);
            const unit = self.expiryUnit;
            const value = self.expiryValue;
            switch (unit) {
                case "milliseconds":
                    return value;
                case "seconds":
                    return value * 1_000;
                case "minutes":
                    return value * 60_000;
                default:
                    return value;
            }
        }
        cloned.expiryAsMinutes = function (): number {
            const self = (this as CachePropCompleted<A>);
            const unit = self.expiryUnit;
            const value = self.expiryValue;
            switch (unit) {
                case "minutes":
                    return value;
                case "seconds":
                    return Math.floor(value / 60);
                case "milliseconds":
                    return Math.floor(value / 60_000);
                default:
                    return value;
            }
        }
        return cacheHub.createChannel(client, cloned);
    }

    static prop<A extends TR = TR>(): BuilderAny<CachePropChannel<A>> {
        if (!this._globalFetched) {
            const fromGlobal = CacheDefaults.export();
            this._defaults = {...this._defaults, ...fromGlobal};
            this._globalFetched = true;
        }
        return Builder.build<CachePropChannel<A>>(null, this._defaults);
    }
}