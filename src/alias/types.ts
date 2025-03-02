import {AliasAny, AliasAnyArray, Id, KeyAny, KeyId, TR} from "../types";
import {ShiftFlat} from "../secure";

export interface CacheAlias<A extends TR, N extends Id> extends ShiftFlat<CacheAliasDef> {

    /**
     * Get the data of alias (really data of owner)
     *
     * @param {AliasAny} alias - alias of data
     * @return {Promise<Object>} - Parsed value of owner
     * */
    getDoc(alias: AliasAny): Promise<Partial<A>>;

    /**
     * Get the data of alias (really data of owner)
     *
     * @param {AliasAny} alias - alias of data
     * @return {Promise<Object>} - Parsed value of owner
     * */
    getRaw<T>(alias: AliasAny): Promise<T>;

    /**
     * Returns the values of all specified aliases (really data of owners).
     *
     * @param {AliasAnyArray} aliases - aliases of data
     * @return {Promise<Array<Object>>} - a record of values at the specified owners
     * */
    listDocs(aliases: AliasAnyArray): Promise<Array<Partial<A>>>;

    /**
     * Returns the values of all specified aliases (really data of owners).
     *
     * @param {AliasAnyArray} aliases - aliases of data
     * @return {Promise<Array<Object>>} - a record of values at the specified owners
     * */
    listRaws<T>(aliases: AliasAnyArray): Promise<Array<T>>;

    /**
     * Get the owner of alias
     *
     * @param {AliasAny} alias - alias of data
     * @return {Promise<KeyAny>} - owner
     * */
    getOwner(alias: AliasAny): Promise<KeyAny>;

    /**
     * Get the data of alias
     *
     * @param {AliasAnyArray} aliases - aliases of data
     * @return {Promise<KeyAny>} - owner
     * */
    listOwners(aliases: AliasAnyArray): Promise<Array<KeyAny>>;

    /**
     * Sets owner with given alias
     *
     * @param {AliasAny} alias - alias of data
     * @param {KeyAny} owner - data
     * @return {Promise<boolean>} - is success?
     *
     * */
    setOwner(alias: AliasAny, owner: KeyAny): Promise<boolean>;

    /**
     * List aliases by owner
     *
     * @param {KeyAny} owner - alias of data
     * @return {Promise<Array<AliasAny>>} - return all aliases
     *
     * */
    listAliases(owner: KeyAny): Promise<Array<AliasAny>>;

    /**
     * Does the owner have alias?
     *
     * @param {KeyAny} owner - owner
     * @return {Promise<boolean>} - the owner has alias or not
     *
     * */
    hasAlias(owner: KeyAny): Promise<boolean>;

    /**
     * Returns if aliases exist
     *
     * @param {AliasAny} alias - alias of data
     * @return {Promise<boolean>} - does the owner exists?
     * */
    exists(alias: AliasAny): Promise<boolean>;

    /**
     * Removes the specified alias.
     *
     * @param {AliasAny} alias - alias of data
     * @return {Promise<number>} - alias is deleted?
     *
     * returns <one of them>
     * - 0 => owner does not exist
     * - 1 => owner was removed
     * */
    delete(alias: AliasAny): Promise<boolean>;

    /**
     * Removes the specified aliases.
     *
     * @param {AliasAnyArray} aliases - aliases of data
     * @return {Promise<number>} - the number of owners that were removed
     * */
    deleteMore(aliases: AliasAnyArray): Promise<number>;

    /**
     * Removes the specified owner without blocking.
     *
     * @param {AliasAny} alias - alias of data
     * @return {Promise<number>} - the number of owners that were removed
     *
     * returns <one of them>
     * - 0 => owner does not exist
     * - 1 => owner was removed
     *
     * Notes
     * - The actual removal will happen later asynchronously
     * */
    unlink(alias: AliasAny): Promise<boolean>;

    /**
     * Removes the specified owner without blocking. An owner is ignored if it does not exist.
     *
     * @param {AliasAnyArray} aliases - aliases of data
     * @return {Promise<number>} - the number of owners that were removed
     *
     * Notes
     * - The actual removal will happen later asynchronously
     * */
    unlinkMore(aliases: AliasAnyArray): Promise<number>;

}

export type CacheAliasDef = CacheAlias<TR, Id>;

