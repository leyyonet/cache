export const SaveModeItems = ['always', 'absent', 'exists'] as const;
/**
 * Save mode for expiry times
 *
 * @enum {string} - literal
 * - always: Always set
 * - absent: Only set the key if it does not already exist. [NX]
 * - exists: Only set the key if it already exists. [XX]
 * */
export type SaveMode = typeof SaveModeItems[number];
