export const ExpiryUnitItems = ['seconds', 'milliseconds', 'minutes'] as const;
/**
 * Expiry unit for expiry times
 *
 * @enum {string} - literal
 * - seconds: if ttl then remaining seconds else the absolute seconds since Jan 1, 1970, {@link ExpirySpan}
 * - milliseconds, if ttl then remaining milliseconds else the absolute milliseconds since Jan 1, 1970, {@link ExpirySpan}
 * - minutes, if ttl then remaining minutes else the absolute minutes since Jan 1, 1970, {@link ExpirySpan}
 * */
export type ExpiryUnit = typeof ExpiryUnitItems[number];
