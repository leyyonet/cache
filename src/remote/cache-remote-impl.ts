import {
    CacheRemote,
    CacheRemoteDeleteLambda,
    CacheRemoteInfo,
    CacheRemoteInvalidateLambda,
    CacheRemoteNotifyLambda
} from "./types";
import {CacheInfoCheck} from "../types";
import {
    CacheInvalidatorDeleteRequest,
    CacheInvalidatorInvalidateRequest,
    CacheInvalidatorNotifyRequest
} from "../invalidator";
import {cacheUtil} from "../util";

// noinspection JSUnusedGlobalSymbols
export class CacheRemoteImpl implements CacheRemote {
    private _notifyLambda: CacheRemoteNotifyLambda;
    private _invalidateLambda: CacheRemoteInvalidateLambda;
    private _deleteLambda: CacheRemoteDeleteLambda;

    protected _enabled: boolean;
    readonly id: string;

    constructor(id: string) {
        this.id = id;
        this._enabled = true;
    }

    // noinspection JSUnusedLocalSymbols
    async info(check: CacheInfoCheck): Promise<CacheRemoteInfo> {
        return {
            id: this.id
        } as CacheRemoteInfo;
    }

    $invalidatorForNotify(data: CacheInvalidatorNotifyRequest): void {
        if (!this._enabled) {
            return;
        }
        if (this._notifyLambda) {
            this._notifyLambda(data)
                .then()
                .catch(e => console.log(`Error for 'invalidate' in remote: ${this.id}! => ${e.message}`));
        }
    }

    $invalidatorForInvalidate(data: CacheInvalidatorInvalidateRequest): void {
        if (!this._enabled) {
            return;
        }
        if (this._invalidateLambda) {
            this._invalidateLambda(data)
                .then()
                .catch(e => console.log(`Error for 'invalidate' in remote: ${this.id}! => ${e.message}`));
        }
    }
    $invalidatorForDelete(data: CacheInvalidatorDeleteRequest): void {
        if (!this._enabled) {
            return;
        }
        if (this._deleteLambda) {
            this._deleteLambda(data)
                .then()
                .catch(e => console.log(`Error for 'delete' in remote: ${this.id}! => ${e.message}`));
        }
    }

    setNotifyLambda(lambda: CacheRemoteNotifyLambda): void {
        cacheUtil.checkLambda('remote.setNotifyLambda', 'lambda', lambda, 1);
        this._notifyLambda = lambda;
    }

    setInvalidateLambda(lambda: CacheRemoteInvalidateLambda): void {
        cacheUtil.checkLambda('remote.setInvalidateLambda', 'lambda', lambda, 1);
        this._invalidateLambda = lambda;
    }

    setDeleteLambda(lambda: CacheRemoteDeleteLambda): void {
        cacheUtil.checkLambda('remote.setDeleteLambda', 'lambda', lambda, 1);
        this._deleteLambda = lambda;
    }

    disable(): void {
        this._enabled = false;
    }

    enable(): void {
        this._enabled = true;
    }

    get enabled(): boolean {
        return this._enabled;
    }
}