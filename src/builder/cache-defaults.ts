import {Builder, BuilderAny} from "@leyyo/builder";
import {CachePropGlobal} from "../prop";
import {TR} from "../channel";

// 24 * 60 * 60 * 1000
export class CacheDefaults {
    private static _export: BuilderAny<CachePropGlobal<TR>>;
    private static _defaults: CachePropGlobal<TR> = {
        enabled: true,
        property: 'id',
        expirySave: 'after',
        expirySet: 'after',
        expiryMode: 'always',
        expiryUnit: 'seconds',
        expiryValue: 24 * 60 * 60,
        setMode: 'always',
        incrementData: 'integer',
        incrementDir: 'increment',
        incrementValue: 1,
    };

    private constructor() {
        throw new Error('No instantiation for this class')
    }

    static export(): CachePropGlobal<TR> {
        if (!this._export) {
            return this._defaults;
        }
        if (typeof this._export.$finalize === 'function') {
            this._export.$finalize();
        }
        return this._export as unknown as CachePropGlobal<TR>;
    }

    static build(): BuilderAny<CachePropGlobal<TR>> {
        this._export = Builder.build<CachePropGlobal<TR>>(null, this._defaults);
        return this._export;
    }
}