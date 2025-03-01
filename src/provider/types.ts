import {CacheCommand} from "../literal/cache-command";
import {CacheInfoCheck} from "../types";
import {CacheClient} from "../client";
import {ShiftMain, ShiftSecure} from "../secure";

export interface CacheProvider extends ShiftSecure<CacheProviderSecure> {
    readonly name: string;

    get notSupportCommands(): Array<CacheCommand>;

    isSupported(command: CacheCommand): boolean;

    info(check: CacheInfoCheck): Promise<CacheProviderInfo>;

    get defaultClient(): CacheClient;
}

export interface CacheProviderSecure extends ShiftMain<CacheProvider> {
    $setDefaultClient(client: CacheClient): void;
}

export interface CacheProviderInfo {
    name: string;
    notSupportCommands?: Array<CacheCommand>;
}