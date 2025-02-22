import {CacheID, TR} from "../channel";

export interface CacheBase<A extends TR, N extends CacheID, C> {
    
}

export interface CacheBaseKey {
    short?: string;
    full?: string;
}
export interface CacheBaseKeys {
    shorts: Array<string>;
    fulls: Array<string>;
    duplicated?: boolean;
}