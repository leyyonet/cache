import {
    CacheInvalidator,
    CacheInvalidatorConsumer,
    CacheInvalidatorFrom,
    CacheInvalidatorResult,
    CacheInvalidatorSecure
} from "./types";
import {CacheChannel, CacheChannelDef} from "../channel";
import {Id, IdAny, IdAnyArray, KeyAny, KeyAnyArray, OneOrMore, TR} from "../types";
import {invalidatorRepo} from "./cache-invalidator-repo-impl";

// noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
export abstract class CacheInvalidatorAbstract<A extends TR, N extends Id> implements CacheInvalidator<A>, CacheInvalidatorSecure<A> {
    protected readonly channel: CacheChannel<A, N>; // from child

    protected constructor(channel: CacheChannel<A, N>) {
        this.channel = channel;
    }

    // region private
    private _disabled<T>(result: T): CacheInvalidatorResult<A, T> {
        const obj = {
            keys: [],
            disabled: true,
            result,
            add: (i, c?) => obj,
            addMore: (i, c?) => obj,
            addFromRelations: (doc) => obj,
            delete: (id) => obj,
            deleteMore: (id) => obj,
        } as CacheInvalidatorResult<A, T>;
        return obj;
    }

    private _ignore<T>(result: T, error: string | Error, command: string): CacheInvalidatorResult<A, T> {
        const obj = {
            keys: [],
            result,
            error,
            command,
            add: (i, c?) => obj,
            addMore: (i, c?) => obj,
            addFromRelations: (doc) => obj,
            delete: (id) => obj,
            deleteMore: (id) => obj,
        } as CacheInvalidatorResult<A, T>;
        return obj;
    }

    // endregion private

    // region link-to-channel
    private _grabId(properties: Array<string>, doc: Partial<A>) {
        if (properties.length < 1) {
            return null;
        }
        const idParts = properties.map(p => doc[p]).filter(p => doc[p] !== undefined);
        return idParts.length > 0 ? this.channel.format.basic(idParts) : null;
    }

    private _add<T>(input: CacheInvalidatorResult<A, T>, id: IdAny, consumer?: CacheInvalidatorConsumer): CacheInvalidatorResult<A, T> {
        if (input.keys.length < 1) {
            return input;
        }
        id = this.channel.format.basic(id);
        if (id) {
            input.keys.forEach(key => this._notify(key, [id], consumer?.id));
        }
        return input;
    }

    private _addMore<T>(input: CacheInvalidatorResult<A, T>, ids: IdAnyArray, consumer?: CacheInvalidatorConsumer): CacheInvalidatorResult<A, T> {
        if (input.keys.length < 1) {
            return input;
        }
        const arr = this.channel.format.basics(ids);
        if (arr.length > 0) {
            input.keys.forEach(key => this._notify(key, arr, consumer?.id));
        }
        return input;
    }

    private _addFromRelationsSelf(doc: Partial<A>, prop: OneOrMore<string>, keys: Array<string>) {
        let properties: Array<string>;
        if (!prop) {
            properties = this.channel.$secure.$pNames;
        } else {
            properties = this.channel.format.checkName(prop);
            if (properties.length < 1) {
                properties = this.channel.$secure.$pNames;
            }
        }
        if (properties.length > 0) {
            const id = this._grabId(properties, doc);
            if (id) {
                keys.forEach(key => this._notify(key, [id]));
            }
        }
    }

    private _addFromRelationsRemote(doc: Partial<A>, prop: OneOrMore<string>, keys: Array<string>, consumerId: string) {
        if (!prop) {
            return
        }
        const properties = this.channel.format.checkName(prop);
        if (properties.length < 1) {
            return;
        }
        const id = this._grabId(properties, doc);
        if (id) {
            keys.forEach(key => this._notify(key, [id], consumerId));
        }
    }

    private _addFromRelationsGroup(doc: Partial<A>, relation: CacheInvalidatorFrom<A>, keys: Array<string>) {
        switch (relation.resource) {
            case "self":
                this._addFromRelationsSelf(doc, relation.property as string, keys);
                break;
            case "consumer":
                this._addFromRelationsRemote(doc, relation.property as string, keys, relation.consumer?.id);
                break;
            case "consumerId":
                this._addFromRelationsRemote(doc, relation.property as string, keys, relation.consumerId);
        }

    }

    private _addFromRelations<T>(input: CacheInvalidatorResult<A, T>, doc: Partial<A>, relations?: OneOrMore<CacheInvalidatorFrom<A>>): CacheInvalidatorResult<A, T> {
        if (input.keys.length < 1 || !doc) {
            return input;
        }
        // itself
        if (!relations) {
            this._addFromRelationsSelf(doc, null, input.keys);
        } else if (Array.isArray(relations)) {
            relations.forEach(relation => {
                this._addFromRelationsGroup(doc, relation, input.keys);
            });
        } else if (typeof relations === 'object') {
            this._addFromRelationsGroup(doc, relations, input.keys);
        }
        return input;
    }

    private _delete<T>(input: CacheInvalidatorResult<A, T>, id: IdAny): CacheInvalidatorResult<A, T> {
        id = this.channel.format.basic(id);
        if (id) {
            this._invalidate(id);
        }
        return input;
    }

    private _deleteMore<T>(input: CacheInvalidatorResult<A, T>, ids: IdAnyArray): CacheInvalidatorResult<A, T> {
        ids = this.channel.format.basics(ids);
        if (ids.length > 0) {
            ids.forEach(id => this._invalidate(id as string));
        }
        return input;
    }

    private _keys(keys: OneOrMore<string>): Array<string> {
        if (!keys) {
            return [];
        } else if (Array.isArray(keys)) {
            return keys;
        } else if (typeof keys === 'string') {
            return [keys];
        }
        return [];
    }

    // endregion link-to-channel

    // region execution
    failed<T>(error: string | Error, keys?: OneOrMore<string>, command?: string): CacheInvalidatorResult<A, T> {
        const obj = {
            error,
            command,
            keys: this._keys(keys),
            add: (i, c?) => obj,
            addMore: (i, c?) => obj,
            addFromRelations: (doc) => obj,
            delete: (id) => obj,
            deleteMore: (id) => obj,
        } as CacheInvalidatorResult<A, T>;
        return obj;
    }

    success<T>(result: T, keys?: OneOrMore<string>, command?: string): CacheInvalidatorResult<A, T> {
        const obj = {
            result,
            command,
            keys: this._keys(keys),
            success: true,
            add: (id: KeyAny, channel?: CacheChannelDef) => this._add(obj, id, channel),
            addMore: (ids: KeyAnyArray, channel?: CacheChannelDef) => this._addMore(obj, ids, channel),
            addFromRelations: (doc: Partial<A>, relations?: OneOrMore<CacheInvalidatorFrom<A>>) => this._addFromRelations(obj, doc, relations),
            delete: (id: KeyAny) => this._delete(obj, id),
            deleteMore: (ids: KeyAnyArray) => this._deleteMore(obj, ids),
        } as CacheInvalidatorResult<A, T>;
        return obj;
    }

    // endregion execution

    // region disabled
    disabledArray<T>(): CacheInvalidatorResult<A, Array<T>> {
        return this._disabled<Array<T>>([]);
    }

    disabledFalse(): CacheInvalidatorResult<A, boolean> {
        return this._disabled(false);
    }

    disabledNull<T>(): CacheInvalidatorResult<A, T> {
        return this._disabled<T>(null);
    }

    disabledRecord<T>(): CacheInvalidatorResult<A, Record<string, T>> {
        return this._disabled<Record<string, T>>({});
    }

    disabledTrue(): CacheInvalidatorResult<A, boolean> {
        return this._disabled(true);
    }

    disabledZero(): CacheInvalidatorResult<A, number> {
        return this._disabled(0);
    }

    // endregion disabled

    // region ignore
    ignoreArray<T>(error?: string | Error, command?: string): CacheInvalidatorResult<A, Array<T>> {
        return this._ignore<Array<T>>([], error, command);
    }

    ignoreFalse(error?: string | Error, command?: string): CacheInvalidatorResult<A, boolean> {
        return this._ignore(false, error, command);
    }

    ignoreNull<T>(error?: string | Error, command?: string): CacheInvalidatorResult<A, T> {
        return this._ignore<T>(null, error, command);
    }

    ignoreRecord<T>(error?: string | Error, command?: string): CacheInvalidatorResult<A, Record<string, T>> {
        return this._ignore<Record<string, T>>({}, error, command);
    }

    ignoreTrue(error?: string | Error, command?: string): CacheInvalidatorResult<A, boolean> {
        return this._ignore(true, error, command);
    }

    ignoreZero(error?: string | Error, command?: string): CacheInvalidatorResult<A, number> {
        return this._ignore(0, error, command);
    }

    // endregion ignore

    // region secure

    get $back(): CacheInvalidator<A> {
        return this;
    }

    get $secure(): CacheInvalidatorSecure<A> {
        return this;
    }

    protected _notify(fullDataKey: string, basicIds: Array<string>, idOwner?: string): void {
        idOwner = idOwner ?? this.channel.id;
        invalidatorRepo.notify(this.channel.id, fullDataKey, idOwner, basicIds);
    }

    protected _invalidate(basicId: string): void {
        invalidatorRepo.invalidate(this.channel.id, basicId);
    }


    // endregion secure

}