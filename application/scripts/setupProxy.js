const proxy = require('http-proxy-middleware');
module.exports = function(app) {
  app.use(
    // sentry CORS issue
    proxy('/sentry/api/0', {
      target: 'https://sentry.io',
      // logLevel: 'debug',
      pathRewrite: {
        '^/sentry': '/',
      },
      changeOrigin: true,
      onProxyReq(proxyReq, req, res) {
        proxyReq.removeHeader('Origin');
      },
    }),
  );
};
