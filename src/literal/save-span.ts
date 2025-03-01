export const SaveSpanItems = ['ttl', 'timestamp', 'keep-ttl', 'persistent'] as const;
/**
 * Save span for expiry times
 *
 * @enum {string} - literal
 * - ttl: Expire ttl (time to live, from now) [EX, PX]
 * - timestamp - Expire at given deadline [EXAT, PXAT]
 * - keep-ttl: Keeps TTL (remaining time), it's not changed {KEEPTTL}
 * - persistent: Stores as persistent
 * */
export type SaveSpan = typeof SaveSpanItems[number];
