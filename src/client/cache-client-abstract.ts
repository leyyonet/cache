import {CacheClient, CacheClientInfo, CacheSecureClientCommand} from "./types";
import {CacheCommand} from "../literal/cache-command";
import {CacheInfoCheck} from "../types";
import {CacheProvider} from "../provider";

// noinspection JSUnusedGlobalSymbols
export abstract class CacheClientAbstract implements CacheClient {
    private static _count: number = 0;
    protected _lastName: string;
    protected _lastId: string | number;
    protected _lastInfo: unknown;
    readonly num: number;
    readonly provider: CacheProvider; // from child
    readonly native: unknown; // from child
    readonly notSupportCommands: Array<CacheCommand>; // from child
    readonly description: string; // from child

    protected constructor(native: unknown, provider: CacheProvider, description?: string) {
        CacheClientAbstract._count++;
        this.num = CacheClientAbstract._count;
        this.native = native;
        this.provider = provider;
        this.description = description ? description : `${provider.name}#${this.num}`;
        this.notSupportCommands = [];
        this._clearInfo();
        this['$$leyyoType'] = Symbol("leyyo.cache,CacheClient");
    }

    protected async _get<T = string>(fn: CacheSecureClientCommand<T>): Promise<T> {
        try {
            return fn();
        } catch (e) {
            return undefined;
        }
    }

    protected _clearInfo() {
        if (!this._lastInfo) {
            setTimeout(() => this._clearInfo(), 30 * 60 * 60_000);
        } else {
            setTimeout(() => this._clearInfo(), 3 * 60 * 60_000);
        }
        this._lastInfo = undefined;
    }


    abstract setName(name: string): Promise<boolean>;

    abstract getName(): Promise<string>;

    abstract getId(): Promise<string | number>;

    abstract getInfo(): Promise<unknown>;

    async _getName(): Promise<string> {
        if (this._lastName) {
            return this._lastName;
        }
        return this.getName();
    }

    async _getId(): Promise<string | number> {
        if (this._lastId) {
            return this._lastId;
        }
        return this.getId();
    }

    async _getInfo(): Promise<unknown> {
        if (this._lastInfo) {
            return this._lastInfo;
        }
        return this.getInfo();
    }

    async info(check: CacheInfoCheck): Promise<CacheClientInfo> {
        if (!check.clients) {
            check.clients = [];
        }
        if (check.clients.includes(this.num)) {
            return {num: this.num};
        }
        check.clients.push(this.num);
        // noinspection ES6MissingAwait
        const promises = [
            this._get(() => this._getId()),
            this._get(() => this._getName()),
            this._get(() => this._getInfo()),
        ] as Array<Promise<string>>;
        const [id, name, bulk] = await Promise.all(promises);
        return {
            num: this.num,
            id,
            name: name ?? this._lastName,
            provider: await this.provider.info(check),
            description: this.description,
            bulk
        };
    }
}