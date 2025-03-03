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
export class CacheInvalidatorImpl<A extends TR, N extends Id> implements CacheInvalidator<A>, CacheInvalidatorSecure<A> {
    protected readonly channel: CacheChannel<A, N>; // from child

    constructor(channel: CacheChannel<A, N>) {
        this.channel = channel;
    }

    // region private
    private _disabled<T>(result: T, command?: string): CacheInvalidatorResult<A, T> {
        const obj = {
            keys: [],
            disabled: true,
            result,
            command,
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

    // endregion link-to-channel

    // region execution
    failed<T>(error: string | Error, keys?: Array<string>, command?: string): CacheInvalidatorResult<A, T> {
        const obj = {
            error,
            command,
            keys,
            add: (i, c?) => obj,
            addMore: (i, c?) => obj,
            addFromRelations: (doc) => obj,
            delete: (id) => obj,
            deleteMore: (id) => obj,
        } as CacheInvalidatorResult<A, T>;
        return obj;
    }

    success<T>(result: T, keys?: Array<string>, command?: string): CacheInvalidatorResult<A, T> {
        const obj = {
            result,
            command,
            keys: keys,
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
    disabledArray<T>(cmd?: string): CacheInvalidatorResult<A, Array<T>> {
        return this._disabled<Array<T>>([], cmd);
    }

    disabledFalse(cmd?: string): CacheInvalidatorResult<A, boolean> {
        return this._disabled(false, cmd);
    }

    disabledText(cmd?: string): CacheInvalidatorResult<A, string> {
        return this._disabled<string>(null, cmd);
    }

    disabledNull<T>(cmd?: string): CacheInvalidatorResult<A, T> {
        return this._disabled<T>(null, cmd);
    }

    disabledRecord<T>(cmd?: string): CacheInvalidatorResult<A, Record<string, T>> {
        return this._disabled<Record<string, T>>({}, cmd);
    }

    disabledTrue(cmd?: string): CacheInvalidatorResult<A, boolean> {
        return this._disabled(true, cmd);
    }

    disabledNumber<N extends number = number>(v1?: N | string, v2?: string): CacheInvalidatorResult<A, N> {
        let def: N;
        let cmd: string;
        if (v1 === undefined && v2 === undefined) {
            def = 0 as N;
        } else if (typeof v1 === 'number') {
            def = v1;
            cmd = v2;
        }
        return this._disabled(def, cmd);
    }

    // endregion disabled

    // region ignore
    ignoreArray<T>(error?: string | Error, cmd?: string): CacheInvalidatorResult<A, Array<T>> {
        return this._ignore<Array<T>>([], error, cmd);
    }

    ignoreFalse(error?: string | Error, cmd?: string): CacheInvalidatorResult<A, boolean> {
        return this._ignore(false, error, cmd);
    }

    ignoreText(error?: string | Error, cmd?: string): CacheInvalidatorResult<A, string> {
        return this._ignore(null, error, cmd);
    }

    ignoreNull<T>(error?: string | Error, cmd?: string): CacheInvalidatorResult<A, T> {
        return this._ignore<T>(null, error, cmd);
    }

    ignoreRecord<T>(error?: string | Error, cmd?: string): CacheInvalidatorResult<A, Record<string, T>> {
        return this._ignore<Record<string, T>>({}, error, cmd);
    }

    ignoreTrue(error?: string | Error, cmd?: string): CacheInvalidatorResult<A, boolean> {
        return this._ignore(true, error, cmd);
    }

    ignoreNumber<N extends number = number>(v1: N | string | Error, v2?: string | Error, v3?: string): CacheInvalidatorResult<A, N> {
        let def: N;
        let error: string | Error;
        let cmd: string;
        if (v1 === undefined && v2 === undefined && v3 === undefined) {
            def = 0 as N;
        } else if (typeof v1 === 'number') {
            def = v1;
            error = v2;
            cmd = v3;
        } else if (typeof v1 === 'string' || v1 instanceof Error) {
            def = 0 as N;
            error = v1;
            cmd = v2 as string;
        }
        return this._ignore(def, error, cmd);
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