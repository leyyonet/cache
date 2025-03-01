export const ExpirySpanItems = ['ttl', 'timestamp'] as const;
/**
 * Expiry span for expiry times
 *
 * @enum {string} - literal
 * - ttl: Expire ttl (time to live, from now) [EX, PX]
 * - timestamp - Expire at given deadline [EXAT, PXAT]
 * */
export type ExpirySpan = typeof ExpirySpanItems[number];

