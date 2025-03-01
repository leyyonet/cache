import {CacheProvider, CacheProviderInfo, CacheProviderSecure} from "./types";
import {CacheCommand, CacheCommandItems} from "../literal/cache-command";
import {CacheInfoCheck} from "../types";
import {CacheClient} from "../client";

// noinspection JSUnusedGlobalSymbols
export abstract class CacheProviderAbstract implements CacheProvider, CacheProviderSecure {
    private readonly _notSupportCommands: Array<CacheCommand>;
    readonly name: string;
    protected _defaultClient: CacheClient;

    protected constructor(name: string) {
        this.name = name;
        this._notSupportCommands = [];
        this['$$leyyoType'] = Symbol('leyyo.cache,CacheProvider');
    }

    protected _addNotSupported(...commands: Array<CacheCommand>): void {
        commands.forEach(command => {
            if (CacheCommandItems.includes(command)) {
                if (!this.notSupportCommands.includes(command)) {
                    this.notSupportCommands.push(command);
                } else {
                    console.warn(`Duplicated not-supported command: ${command} for ${this.name} provider`);
                }
            } else {
                console.warn(`Invalid not-supported command: ${command} for ${this.name} provider`);
            }
        })
    }

    async info(check: CacheInfoCheck): Promise<CacheProviderInfo> {
        if (!check.providers) {
            check.providers = [];
        }
        if (check.providers.includes(this.name)) {
            return {name: this.name} as CacheProviderInfo;
        }
        check.providers.push(this.name);
        return {
            name: this.name,
            notSupportCommands: [...this._notSupportCommands]
        } as CacheProviderInfo;
    }

    isSupported(command: CacheCommand): boolean {
        return !this.notSupportCommands.includes(command);
    }

    get defaultClient(): CacheClient {
        return this._defaultClient;
    }

    get notSupportCommands(): Array<CacheCommand> {
        return [...this._notSupportCommands];
    }

    // region secure
    get $back(): CacheProvider {
        return this;
    }

    get $secure(): CacheProviderSecure {
        return this;
    }

    $setDefaultClient(client: CacheClient): void {
        if (this._defaultClient) {
            throw new Error(`Default client was already set for provider: ${this.name}`);
        }
        this._defaultClient = client;
    }

    // endregion secure


}