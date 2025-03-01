// yelmer: move to leyyo
export interface ShiftSecure<S> {
    get $secure(): S;
}

export interface ShiftFlat<D> {
    get $flat(): D;
}

export type ShiftSecureFlat<S, D> = ShiftSecure<S> & ShiftFlat<D>;

export interface ShiftMain<M> {
    get $back(): M;
}
