// yelmer: move to leyyo
export interface ShiftSecure<S extends ShiftMain<any>> {
    get $secure(): S;
}

export interface ShiftFlat<D> {
    get $flat(): D;
}

export type ShiftSecureFlat<S extends ShiftMain<any>, D> = ShiftSecure<S> & ShiftFlat<D>;

export interface ShiftMain<M extends ShiftSecure<any>> {
    get $back(): M;
}

export interface InitLike {
    $init(...args: Array<unknown>): void;
}
