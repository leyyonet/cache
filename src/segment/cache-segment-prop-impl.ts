import {CacheAbstractPropImpl, CachePropData} from "../prop";
import {CacheSegmentProp, CacheSegmentPropData, CacheSegmentPropSecure} from "./types";

export class CacheSegmentPropImpl extends CacheAbstractPropImpl implements CacheSegmentProp, CacheSegmentPropSecure {

    constructor(data: CachePropData | CacheSegmentPropData, parent: CachePropData) {
        super(data, parent)
    }

    // region secure
    get $secure(): CacheSegmentPropSecure {
        return this;
    }

    get $back(): CacheSegmentProp {
        return this;
    }

    get $pure(): Partial<CacheSegmentPropData> {
        return this._pure;
    }

    $setPure(pure: Partial<CacheSegmentPropData>): void {
        this._setPure(pure);
    }

    // endregion secure
}