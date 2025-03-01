import {cacheConfig} from "../config";
import {cacheHub} from "../hub";
import {CacheInvalidatorNotifyRecords, CacheInvalidatorRepo} from "./types";

// Record< dataFullKey, dataOwner >
type AddDataMap = Map<string, string>;


// Map< idBasicKey, AddDataMap >
type AddIdBasicMap = Map<string, AddDataMap>;

// Map< idOwner, idBasicKey >
type AddIdOwnerMap = Map<string, AddIdBasicMap>;

type DeleteIdOwnerMap = Map<string, Set<string>>;

interface TriggerStats {
    notifies: number;
    invalidates: number;
    times: number;
}

class CacheInvalidatorRepoImpl implements CacheInvalidatorRepo {

    // Map< time, AddIdOwnerMap >
    protected readonly _notifyQueue: Map<number, AddIdOwnerMap>;
    // Map< time, Map< idOwner, Set< idFullKey > > >
    protected readonly _invalidatesQueue: Map<number, DeleteIdOwnerMap>;
    protected _zeroCount = 0;

    constructor() {
        this._notifyQueue = new Map<number, AddIdOwnerMap>();
        this._invalidatesQueue = new Map<number, DeleteIdOwnerMap>();

        setTimeout(() => this._trigger(), cacheConfig.invalidation.firstInterval);
    }

    private _chunkArray<T>(values: Array<T>, size: number): Array<Array<T>> {
        const chunks = [] as Array<Array<T>>;
        for (let i = 0; i < values.length; i += size) {
            chunks.push(values.slice(i, i + size));
        }
        return chunks;
    }

    private _trigger() {
        const size = this._notifyQueue.size + this._invalidatesQueue.size;
        if (size > 0) {
            const now = this._now();
            const stats = {notifies: 0, invalidates: 0, times: 0} as TriggerStats;
            this._triggerForNotify(now, stats);
            this._triggerForInvalidate(now, stats);
            if (stats.times > 0) {
                console.log(`Invalidator run. ${JSON.stringify(stats)}`);
            }
        }
        this._schedule(size);
    }

    private _triggerForNotify(now: number, stats: TriggerStats): void {
        if (this._notifyQueue.size < 1) {
            return;
        }
        const chunkSize = cacheConfig.invalidation.chunkSizeAdd;
        for (const [time, ownerMap] of this._notifyQueue.entries()) {
            stats.times++;
            if (time < now) {
                for (const [idOwner, idBasicMap] of ownerMap.entries()) {
                    const invalidatorConsumer = cacheHub.getInvalidatorConsumer(idOwner);
                    if (!invalidatorConsumer) {
                        // todo
                        continue;
                    }
                    const chunks = [] as Array<CacheInvalidatorNotifyRecords>;

                    // Record<idBasicKey, Record<dataFullKey, dataOwner>>
                    let currentChunk = {} as CacheInvalidatorNotifyRecords;
                    let count = 0;

                    for (const [idBasicKey, dataMap] of idBasicMap.entries()) {
                        currentChunk[idBasicKey] = Object.fromEntries(dataMap.entries());
                        if (count === chunkSize) {
                            chunks.push({...currentChunk}); // cloned
                            currentChunk = {};
                            count = 0;
                        } else {
                            count++;
                        }
                        dataMap.clear();
                        stats.notifies++;
                    }
                    idBasicMap.clear();
                    if (Object.keys(currentChunk).length > 0) {
                        chunks.push({...currentChunk}); // cloned
                    }
                    chunks.forEach(chunk => {
                        invalidatorConsumer.$invalidatorForNotify({
                            from: 'todo',
                            records: chunk,
                        });
                    });
                }
                this._notifyQueue.delete(time);
            }
        }
    }

    private _triggerForInvalidate(now: number, stats: TriggerStats): void {
        if (this._invalidatesQueue.size < 1) {
            return;
        }
        const chunkSize = cacheConfig.invalidation.chunkSizeDelete;
        for (const [time, idOwnerMap] of this._invalidatesQueue.entries()) {
            stats.times++;
            if (time < now) {
                for (const [idOwner, idBasicKeySet] of idOwnerMap.entries()) {
                    const invalidatorConsumer = cacheHub.getInvalidatorConsumer(idOwner);
                    if (!invalidatorConsumer) {
                        // todo
                        continue;
                    }
                    const idBasicKeys = Array.from(idBasicKeySet.keys());
                    if (idBasicKeys.length < chunkSize) {
                        invalidatorConsumer.$invalidatorForInvalidate({from: 'todo', ids: idBasicKeys});
                    } else {
                        const chunks = this._chunkArray(idBasicKeys, chunkSize);
                        chunks.forEach(chunk => {
                            invalidatorConsumer.$invalidatorForInvalidate({from: 'todo', ids: chunk});
                        });
                    }
                    stats.invalidates += idBasicKeys.length;
                    idBasicKeySet.clear();
                }
                this._invalidatesQueue.delete(time);
            }
        }
    }

    private _schedule(size: number) {
        let interval = 1000;
        if (size > 1) {
            this._zeroCount = 0;
        } else if (size === 0) {
            if (this._zeroCount < 5) {
                interval = 2_000;
            } else {
                interval = 10_000;
            }
            if (this._zeroCount === Number.MAX_SAFE_INTEGER - 1) {
                this._zeroCount = 0;
            } else {
                this._zeroCount++;
            }
        }
        setTimeout(() => this._trigger(), interval);
    }

    private _now(): number {
        const now = new Date();
        now.setSeconds(0);
        return now.getTime();
    }


    notify(dataOwner: string, dataFullKey: string, idOwner: string, idBasicKeys: Array<string>): void {
        const now = this._now();
        let idOwnerMap: AddIdOwnerMap;
        let idBasicMap: AddIdBasicMap;
        let dataRec: AddDataMap;
        if (!this._notifyQueue.has(now)) {
            idOwnerMap = new Map() as AddIdOwnerMap;
            idBasicMap = new Map() as AddIdBasicMap;
            idOwnerMap.set(idOwner, idBasicMap);
            this._notifyQueue.set(now, idOwnerMap);
        } else {
            idOwnerMap = this._notifyQueue.get(now);
            if (!idOwnerMap.has(idOwner)) {
                idBasicMap = new Map() as AddIdBasicMap;
                idOwnerMap.set(idOwner, idBasicMap);
            } else {
                idBasicMap = idOwnerMap.get(idOwner);
            }
        }
        idBasicKeys.forEach(idBasicKey => {
            if (!idBasicMap.has(idBasicKey)) {
                dataRec = new Map<string, string>();
                dataRec.set(dataFullKey, dataOwner);
                idBasicMap.set(idBasicKey, dataRec);
            } else {
                idBasicMap.get(idBasicKey).set(dataFullKey, dataOwner);
            }
        });
    }

    invalidate(idOwner: string, idBasicKey: string): void {
        const now = this._now();
        let idMap: Map<string, Set<string>>;
        let idSet: Set<string>;
        if (!this._invalidatesQueue.has(now)) {
            idMap = new Map<string, Set<string>>();
            idSet = new Set<string>();
            idSet.add(idBasicKey);
            idMap.set(idOwner, idSet);
            this._invalidatesQueue.set(now, idMap);
            return;
        }
        idMap = this._invalidatesQueue.get(now);
        if (!idMap.has(idOwner)) {
            idSet = new Set<string>();
            idSet.add(idBasicKey);
            idMap.set(idOwner, idSet);
            return;
        }
        idMap.get(idOwner).add(idBasicKey);
    }
}

export const invalidatorRepo = new CacheInvalidatorRepoImpl();