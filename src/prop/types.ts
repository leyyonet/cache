import {TR} from "../channel";
import {
    CacheOptExpiryModeType,
    CacheOptExpirySaveType,
    CacheOptExpirySetType,
    CacheOptExpiryUnitType,
    CacheOptIncDataType,
    CacheOptIncDirType,
    CacheOptSetModeType
} from "../command";

export interface CachePropGlobal<A extends TR> {
    enabled: boolean;
    property: keyof A;
    expirySave: CacheOptExpirySaveType;
    expirySet: CacheOptExpirySetType;
    expiryMode: CacheOptExpiryModeType;
    expiryUnit: CacheOptExpiryUnitType;
    expiryValue: number;
    setMode: CacheOptSetModeType;
    incrementData: CacheOptIncDataType;
    incrementDir: CacheOptIncDirType,
    incrementValue: number;
}
export interface CachePropChannel<A extends TR> extends CachePropGlobal<A> {
    prefix: string;
}
export interface CachePropCompleted<A extends TR> extends CachePropChannel<A> {
    enable(): void;
    disable(): void;
    expiryAs(unit: CacheOptExpiryUnitType): number;
    expiryAsSeconds(): number;
    expiryAsMilliseconds(): number;
    expiryAsMinutes(): number;
}
export type CachePropReadonly<A extends TR>  = Readonly<CachePropCompleted<A>>;

export interface CachePropLike<A extends TR> extends Readonly<CachePropGlobal<A>> {
    readonly prefix: string;
    enable(): void;
    disable(): void;
    expiryAs(unit: CacheOptExpiryUnitType): number;
    expiryAsSeconds(): number;
    expiryAsMilliseconds(): number;
    expiryAsMinutes(): number;
}
