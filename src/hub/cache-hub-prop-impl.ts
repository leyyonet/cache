import {CacheAbstractPropImpl, CachePropData} from "../prop";
import {CacheHubProp, CacheHubPropData, CacheHubPropSecure} from "./types";

// noinspection JSUnusedGlobalSymbols
export class CacheHubPropImpl extends CacheAbstractPropImpl implements CacheHubProp, CacheHubPropSecure {

    constructor(data: CachePropData | CacheHubPropData, parent: CachePropData) {
        super(data, parent)
    }

    // region secure
    get $back(): CacheHubProp {
        return this;
    }

    get $secure(): CacheHubPropSecure {
        return this;
    }

    get $pure(): Partial<CacheHubPropData> {
        return this._pure;
    }

    $setPure(pure: Partial<CacheHubPropData>): void {
        this._setPure(pure);
    }

    // endregion secure
}