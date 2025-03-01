export const cacheConfig = {
    delimiterBetweenParts: ':',
    delimiterParents: '.', // between segment.prefix, entity.name, channel.path
    afterParent: '/', // {delimiterParents}{afterParent}{full}
    aliasPrefix: 'a/',
    ownerPrefix: 'o/',
    keyPrefix: 'k/',
    invalidationPrefix: 'i/',
    invalidation: {
        firstInterval: 10_000,
        chunkSizeAdd: 1_000,
        chunkSizeDelete: 1_000,
    },
};