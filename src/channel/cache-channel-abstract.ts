import {CacheClient} from "../client";
import {
    CacheChannel,
    CacheChannelDef,
    CacheChannelInfo,
    CacheChannelProp,
    CacheChannelPropData,
    CacheChannelPropLambda,
    CacheChannelSecure
} from "./types";
import {CacheHash} from "../hash";
import {CacheBasic} from "../basic";
import {CacheSet} from "../set";
import {
    CacheInvalidator,
    CacheInvalidatorDeleteRequest,
    CacheInvalidatorImpl,
    CacheInvalidatorInvalidateRequest,
    CacheInvalidatorNotifyRequest
} from "../invalidator";
import {cacheUtil, CacheUtil} from "../util";
import {CacheEntity} from "../entity";
import {CacheChannelPropImpl} from "./cache-channel-prop-impl";
import {CacheInfoCheck, Id, TR} from "../types";
import {CacheFormat} from "../format";
import {Builder} from "@leyyo/builder";
import {CacheAlias} from "../alias";
import {cacheHub} from "../hub";
import {DLM_AFTER_PARENT, DLM_BETWEEN_PARENTS} from "../config";

// noinspection JSUnusedGlobalSymbols
export abstract class CacheChannelAbstract<A extends TR, N extends Id> implements CacheChannel<A, N>, CacheChannelSecure<A, N> {
    // region properties
    readonly full: string; // here
    protected _pNames: Array<string>;
    readonly entity: CacheEntity<A>; // from child
    readonly hash: CacheHash<A, N>; // from child
    readonly basic: CacheBasic<A, N>; // from child
    readonly set: CacheSet<A, N>; // from child
    readonly alias: CacheAlias<A, N>; // from child
    readonly format: CacheFormat<A, N>; // from child
    readonly client: CacheClient; // from child

    readonly path: string; // here
    readonly id: string; // here
    readonly util: CacheUtil; // here
    readonly prop: Readonly<CacheChannelProp<A>>; // here

    readonly invalidator: CacheInvalidator<A>; // here

    // endregion properties

    // region constructor
    protected constructor(entity: CacheEntity<A>, path: string, prop: CacheChannelPropData<A>, id: string, client: CacheClient) {
        this._pNames = [];
        this.entity = entity;
        this.path = path;
        this.id = id;
        this.client = client as CacheClient;
        this.prop = new CacheChannelPropImpl(prop, entity.prop);
        this.invalidator = new CacheInvalidatorImpl(this);
        this._pNames = cacheUtil.parseProperties(this.prop.property);
        this.util = cacheUtil;
        cacheHub.$secure.$checkInvalidatorConsumer(this.$flat);

        const parts = ([this.entity.segment.path, this.entity.path, this.path] as Array<string>)
            .map(item => cacheUtil.alphaNumeric(item))
            .filter(item => !!item);
        if (parts.length > 0) {
            this.full = parts.join(DLM_BETWEEN_PARENTS) + DLM_AFTER_PARENT;
        } else {
            this.full = DLM_AFTER_PARENT;
        }

    }

    // endregion constructor

    // region plugins


    async info(check: CacheInfoCheck): Promise<CacheChannelInfo> {
        return {
            id: this.id ?? undefined,
            path: this.path ?? undefined,
            client: await this.client.info(check),
            prop: this.prop.$secure.$pure as Partial<CacheChannelPropData<TR>>,
        };
    }

    // endregion plugins

    changeProp(lambda: CacheChannelPropLambda<A>): void {
        this.$setProp(cacheUtil.readProp(lambda(Builder.build<CacheChannelPropData<A>>())));
    }

    // region secure
    get $flat(): CacheChannelDef {
        return this as CacheChannelDef;
    }

    get $secure(): CacheChannelSecure<A, N> {
        return this;
    }

    get $back(): CacheChannel<A, N> {
        return this;
    }

    get $pNames(): Array<string> {
        return this._pNames;
    }

    $setProp(prop: Partial<CacheChannelPropData<A>>): void {
        this.prop.$secure.$setPure(prop);
        this._pNames = cacheUtil.parseProperties(this.prop.property);
    }

    // endregion secure

    $invalidatorForInvalidate(data: CacheInvalidatorInvalidateRequest): void {
        // Array<idBasicKeys>
        if (data.ids.length < 1) {
            return;
        }
        data.ids.forEach(id => {
            const {full} = this.format.invalidation(id);
            if (full) {
                this.hash.$secure
                    .$getAll(full)
                    .then(dataRec => {
                        // Record<dataOwner, Array<dataFullKey>>
                        const dataOwnerMap = {} as Record<string, Array<string>>;
                        // Record<dataFullKey, dataOwner>
                        for (const [dataFullKey, dataOwner] of Object.entries(dataRec)) {
                            if (dataOwnerMap[dataOwner] === undefined) {
                                dataOwnerMap[dataOwner] = [];
                            }
                            dataOwnerMap[dataOwner].push(dataFullKey);
                        }
                        for (const [dataOwner, dataFullKeys] of Object.entries(dataOwnerMap)) {
                            // delete data keys
                            if (dataOwner === this.id) {
                                this.basic.$secure
                                    .$deleteMore(dataFullKeys)
                                    .then()
                                    .catch(e => {
                                        // todo
                                        console.log(e)
                                    })
                            } else {
                                const consumer = cacheHub.getInvalidatorConsumer(dataOwner);
                                consumer.$invalidatorForDelete({
                                    from: '',
                                    ids: dataFullKeys,
                                });
                            }
                        }

                        // delete invalidator key
                        this.basic.$secure
                            .$delete(full)
                            .then()
                            .catch(e => {
                                // todo
                                console.log(e)
                            });
                    });
            }
        });
    }

    // Record<idBasicKey, Record<dataFullKey, dataOwner>>
    $invalidatorForNotify(data: CacheInvalidatorNotifyRequest): void {
        for (const [idBasicKey, dataRec] of Object.entries(data?.records)) {
            if (Object.keys(dataRec).length < 1) {
                continue;
            }
            const {full} = this.format.invalidation(idBasicKey);
            if (full) {
                this.hash.$secure.$set(full, dataRec).then();
            }
        }

    }

    $invalidatorForDelete(data: CacheInvalidatorDeleteRequest): void {
        // triggered from another channel
        this.basic.$secure
            .$deleteMore(data.ids)
            .then()
            .catch(e => {
                // todo
                console.log(e)
            });
    }


}