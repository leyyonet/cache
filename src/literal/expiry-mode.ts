export const ExpiryModeItems = ['always', 'absent', 'exists', 'greater', 'less'] as const;
/**
 * Expiry mode for expiry changing
 *
 * @enum {string} - literal
 * - always: Always set
 * - absent: et expiry only when the key has no expiry [NX]
 * - exists: Set expiry only when the key has an existing expiry [XX]
 * - greater: Set expiry only when the new expiry is greater than current one [GT]
 * - less: Set expiry only when the new expiry is less than current one [LT] * */
export type ExpiryMode = typeof ExpiryModeItems[number];