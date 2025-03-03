import {AliasAny, AliasAnyArray, Id, KeyAny, TR} from "../types";
import {InitLike, ShiftMain, ShiftSecureFlat} from "../secure";
import {CacheOptExpiryUnitTuple, CacheOptSaveSpan, CacheResultBoolean, CacheResultNumber} from "../command";

export interface CacheAlias<A extends TR, N extends Id> extends ShiftSecureFlat<CacheAliasSecure<A, N>, CacheAliasDef> {

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
     * @return {Promise<string>} - owner
     * */
    getOwner(alias: AliasAny): Promise<string>;

    /**
     * Get the data of alias
     *
     * @param {AliasAnyArray} aliases - aliases of data
     * @return {Promise<Array<string>>} - owner
     * */
    listOwners(aliases: AliasAnyArray): Promise<Array<string>>;

    /**
     * Sets owner with given alias
     *
     * @param {AliasAny} alias - alias of data
     * @param {KeyAny} owner - data
     * @param {CmdAliasSet} opt - opt
     * @return {Promise<CacheResultBoolean>} - is success?
     *
     * */
    setOwner(alias: AliasAny, owner: KeyAny, opt?: CmdAliasSet): Promise<CacheResultBoolean>;

    /**
     * List aliases by owner
     *
     * @param {KeyAny} owner - alias of data
     * @return {Promise<Array<string>>} - return all aliases
     *
     * */
    listAliases(owner: KeyAny): Promise<Array<string>>;

    /**
     * Does the owner have alias?
     *
     * @param {KeyAny} owner - owner
     * @return {Promise<CacheResultBoolean>} - the owner has alias or not
     *
     * */
    hasAlias(owner: KeyAny): Promise<CacheResultBoolean>;

    /**
     * Returns if aliases exist
     *
     * @param {AliasAny} alias - alias of data
     * @return {Promise<CacheResultBoolean>} - does the owner exists?
     * */
    exists(alias: AliasAny): Promise<CacheResultBoolean>;

    /**
     * Returns if aliases exist
     *
     * @param {AliasAnyArray} aliases - aliases of data
     * @return {Promise<Array<>CacheResultBoolean>>} - does the owner exists?
     * */
    existMore(aliases: AliasAnyArray): Promise<Array<CacheResultBoolean>>;

    /**
     * Removes the specified alias.
     *
     * @param {AliasAny} alias - alias of data
     * @return {Promise<CacheResultNumber>} - alias is deleted?
     *
     * returns <one of them>
     * - 0 => owner does not exist
     * - 1 => owner was removed
     * */
    delete(alias: AliasAny): Promise<CacheResultNumber>;

    /**
     * Removes the specified aliases.
     *
     * @param {AliasAnyArray} aliases - aliases of data
     * @return {Promise<CacheResultNumber>} - the number of owners that were removed
     * */
    deleteMore(aliases: AliasAnyArray): Promise<CacheResultNumber>;

    /**
     * Removes the specified owner without blocking.
     *
     * @param {AliasAny} alias - alias of data
     * @return {Promise<CacheResultNumber>} - the number of owners that were removed
     *
     * returns <one of them>
     * - 0 => owner does not exist
     * - 1 => owner was removed
     *
     * Notes
     * - The actual removal will happen later asynchronously
     * */
    unlink(alias: AliasAny): Promise<CacheResultNumber>;

    /**
     * Removes the specified owner without blocking. An owner is ignored if it does not exist.
     *
     * @param {AliasAnyArray} aliases - aliases of data
     * @return {Promise<CacheResultNumber>} - the number of owners that were removed
     *
     * Notes
     * - The actual removal will happen later asynchronously
     * */
    unlinkMore(aliases: AliasAnyArray): Promise<CacheResultNumber>;

}

export type CacheAliasDef = CacheAlias<TR, Id>;

export interface CacheAliasSecure<A extends TR, N extends Id> extends ShiftMain<CacheAlias<A, N>>, InitLike {
}

export type CmdAliasSet = CacheOptSaveSpan & CacheOptExpiryUnitTuple;
