export type OneOrMore<T> = T | Array<T>;

export type Id = string | number;
export type IdArray = Array<Id>;
export type IdAny = OneOrMore<Id>;
export type IdAnyArray = Array<IdAny>;

export type KeyId = Id;

export type KeyAny = OneOrMore<KeyId>;
export type KeyAnyArray = Array<KeyAny>;

export type AliasId = Id;

export type AliasAny = OneOrMore<AliasId>;
export type AliasAnyArray = Array<AliasAny>;

export type Members = Id;
export type MemberId<N extends Members = Members> = N;
// noinspection JSUnusedGlobalSymbols
export type MemberIdArray = Array<MemberId>;

export type TR = Object | Record<string, unknown>;
export type FieldId<A extends TR> = keyof A | string;
export type FieldIddArray<A extends TR = TR> = Array<FieldId<A>>;
export type FieldValue<A extends TR = TR> = A[keyof A] | string | number;
export type FieldMap<A extends TR = TR> = Map<FieldId<A>, FieldValue<A>>;
export type FieldTuple<A extends TR = TR> = [FieldId<A>, FieldValue<A>];
export type FieldTupleArray<A extends TR = TR> = Array<FieldTuple<A>>;

export type IdType = 'key' | 'alias' | 'owner' | 'invalidation' | 'field' | 'member';
// noinspection JSUnusedGlobalSymbols
export type SameType<E, T> = {
    [P in keyof E]?: T;
};

export interface CacheInfoCheck {
    clients?: Array<number>,
    providers?: Array<string>,
}

/**
 *
 * class MyPromise extends Promise {
 *     myMethod() {
 *         return this.then(str => str.toUpperCase());
 *     }
 * }
 *
 * // Usage example 1
 * MyPromise.resolve("it works")
 *     .myMethod()
 *     .then(result => console.log(result))
 *     .catch(error => console.error(error));
 *
 * // Usage example 2
 * await new MyPromise((resolve, reject) => {
 *     if (Math.random() < 0.5) {
 *         resolve("it works");
 *     } else {
 *         reject(new Error("promise rejected; it does this half the time just to show that part working"));
 *     }
 * })
 *     .myMethod();
 * */