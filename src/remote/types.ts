import {CacheInfoCheck} from "../types";
import {
    CacheInvalidatorConsumer,
    CacheInvalidatorDeleteRequest,
    CacheInvalidatorInvalidateRequest,
    CacheInvalidatorNotifyRequest
} from "../invalidator";

export interface CacheRemote extends CacheInvalidatorConsumer {
    readonly id: string;


    setNotifyLambda(lambda: CacheRemoteNotifyLambda): void;

    setInvalidateLambda(lambda: CacheRemoteInvalidateLambda): void;
    setDeleteLambda(lambda: CacheRemoteDeleteLambda): void;

    get enabled(): boolean;

    disable(): void;

    enable(): void;

    info(check: CacheInfoCheck): Promise<CacheRemoteInfo>;
}

export interface CacheRemoteInfo {
    id: string;
}

export type CacheRemoteNotifyLambda = (data: CacheInvalidatorNotifyRequest) => Promise<unknown>;
export type CacheRemoteInvalidateLambda = (data: CacheInvalidatorInvalidateRequest) => Promise<unknown>;
export type CacheRemoteDeleteLambda = (data: CacheInvalidatorDeleteRequest) => Promise<unknown>;
