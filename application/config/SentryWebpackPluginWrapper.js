const SentryWebpackPlugin = require('@sentry/webpack-plugin');

function SentryWebpackPluginWrapper(options) {
  const sentryPluginInstance = new SentryWebpackPlugin(options);
  // replace a empty implement here to prevent upload sourcemap.
  sentryPluginInstance.finalizeRelease = function() {
    return Promise.resolve();
  };
  return sentryPluginInstance;
}

module.exports = SentryWebpackPluginWrapper;
