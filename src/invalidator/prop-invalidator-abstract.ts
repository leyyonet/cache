import {PropInvalidator} from "./types";
import {CacheBaseAbstract} from "../base";
import {CacheID, TR} from "../channel";

export abstract class PropInvalidatorAbstract<A extends TR, N extends CacheID, C> extends CacheBaseAbstract<A, N, C> implements PropInvalidator<A, N, C> {
    protected checkPrefix(prefix: string): string {
        return prefix ? prefix : this.prop.prefix;
    }
    protected fullKey(identifier: CacheID, prefix: string): string {
        return`#${prefix}${identifier}`;
    }
    abstract add(memberFull: string, identifiers: Array<CacheID>, prefix?: string): void;
    abstract remove(identifier: CacheID, prefix?: string): void;
}