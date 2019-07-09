module.exports = [
  {
    // Match any request ends with .png, .jpg, .jpeg or .svg.
    urlPattern: /[\s\S]*\.(?:png|jpg|jpeg|gif|svg)\b/i,
    // Apply a cache-first strategy.
    handler: 'CacheFirst',
    options: {
      // Use a custom cache name for this route.
      cacheName: 'images-cache',
      // Configure custom cache expiration.
      expiration: {
        maxEntries: 250,
        maxAgeSeconds: 30 * 24 * 60 * 60,
        purgeOnQuotaError: true,
      },
      // Configure which responses are considered cacheable.
      cacheableResponse: {
        statuses: [200],
      },
      fetchOptions: {
        mode: 'cors',
      },
    },
  },
];
