import {CacheProvider, CacheProviderInfo} from "../provider";
import {CacheInfoCheck} from "../types";

export interface CacheClient {
    readonly num: number;
    readonly provider: CacheProvider;
    readonly description: string;
    readonly native: unknown;

    setName(name: string): Promise<boolean>;

    getName(): Promise<string>;

    getId(): Promise<string | number>;

    getInfo(): Promise<unknown>;

    info(check: CacheInfoCheck): Promise<CacheClientInfo>;
}

export interface CacheClientInfo {
    num: number
    provider?: CacheProviderInfo;
    name?: string;
    description?: string;
    id?: string | number;
    bulk?: unknown;
}

export type CacheSecureClientCommand<T> = () => Promise<T>;

export type CacheClientCreatorLambda = (native: unknown, description?: string) => CacheClient;
