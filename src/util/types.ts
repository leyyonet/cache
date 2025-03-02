import {BuilderAny} from "@leyyo/builder";
import {Id} from "../types";

export interface CacheUtil {
    bindAll(instance: Object): void;
    objectInfo(value: unknown): string;

    checkObject(holder: string, type: string, obj: unknown, fn: string): void;

    checkName(holder: string, type: string, value: string, canBeNull?: boolean): string;

    checkLambda(holder: string, type: string, lambda: Function, min?: number): void;

    readProp<T>(prop: BuilderAny<T> | T): T;

    parseProperties(property: unknown, def?: Array<string>): Array<string>;

    utcSec(seconds: number): number;

    utcMs(milliseconds: number): number;

    parseOne<T>(value: unknown): T;

    parseArray<T>(value: Array<unknown>): Array<T>;

    parseObject<T>(value: Record<string, unknown>): Record<string, T>;

    jsonOne(value: unknown): string;

    jsonArray(value: Array<unknown>): Array<string>;

    jsonObject(value: Record<string, unknown>): Record<string, string>;

    asArray<T>(value: Array<T>): Array<T>;

    asKey(value: unknown): string;

    asKeys(values: unknown): Array<string>;

    asObject<T>(value: Record<string, T> | Object | Map<string, T> | Array<[string, T]>): Record<string, T>;

    objectFromKeys<T>(keys: Array<Id>, def?: T, values?: Array<T>): Record<string, T>;
}