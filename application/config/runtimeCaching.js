const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.1/8 is considered localhost for IPv4.
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/),
);

module.exports = [
  {
    // Match any request ends with .png, .jpg, .jpeg or .svg.
    urlPattern: ({ url }) => {
      if (isLocalhost) {
        return false;
      }
      const matchTegExp = /[\s\S]*(?:\.s3-accelerate\.amazonaws\.com)[\s\S]*\.(?:png|jpg|jpeg|gif|svg)\b/i;
      return matchTegExp.test(url.href);
    },
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
        credentials: 'omit',
      },
    },
  },
];
