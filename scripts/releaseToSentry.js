const path = require('path');
const SentryWebpackPlugin = require('@sentry/webpack-plugin');
const paths = require('../application/config/paths');

// eslint-disable-next-line import/no-dynamic-require
const appPackage = require(paths.appPackageJson);
const rootPath = path.resolve(__dirname, '../');
const options = {
  release: appPackage.version,
  include: path.resolve(rootPath, './application/build/static/js'),
  urlPrefix: '~/static/js',
  configFile: path.resolve(rootPath, './sentry.properties'),
};

const sentryPlugin = new SentryWebpackPlugin(options);
const { include } = sentryPlugin.options;

if (!include) {
  console.error('`include` option is required');
  return Promise.resolve();
}

let release;
return sentryPlugin.release
  .then(proposedVersion => {
    release = proposedVersion;
    return sentryPlugin.cli.releases.new(release);
  })
  .then(() =>
    sentryPlugin.cli.releases.uploadSourceMaps(release, sentryPlugin.options),
  )
  .then(() => sentryPlugin.cli.releases.finalize(release))
  .catch(err => console.error(err.message));
