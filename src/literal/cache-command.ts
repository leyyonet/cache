export const CacheCommandItems = ([
    // basic
    'get', 'getMore',
    'set', 'setMore',
    'exists', 'existsMore',
    'delete', 'deleteMore',
    'unlink', 'unlinkMore',
    'expire', 'expireAt', 'expireTime', 'ttl', 'persist',
    'copy', 'type', 'info',
    // hash
    'getField', 'getFieldAll', 'getFieldMore',
    'setField', 'setFieldMore',
    'deleteField', 'deleteFieldMore',
    'hasField', 'hasFieldMore',
    'expireField', 'expireAtField', 'expireTimeField', 'ttlField', 'persistField',
    'fields', 'fieldLength', 'fieldValues', 'fieldValuesAll',
    'randomField', 'randomFieldMore', 'randomFieldValues',
    // set
    'addMember', 'removeMember',
    'members', 'memberLength',
    'hasMember', 'hasMemberMore',

] as const);
/**
 * Cache Commands
 *
 * @enum {string} - literal
 * - get:
 * */
export type CacheCommand = typeof CacheCommandItems[number];