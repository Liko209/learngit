/**
 * WEBPACK DLL GENERATOR
 *
 * This profile is used to cache webpack's module
 * contexts for external library and framework type
 * dependencies which will usually not change often enough
 * to warrant building them from scratch every time we use
 * the webpack process.
 */
const path = require('path');
const webpack = require('webpack');
const getClientEnvironment = require('./env');
const paths = require('./paths');
const dllPlugin = require('./dll');
const appPackage = require(paths.appPackageJson);

const dllConfig = dllPlugin.defaults;
const outputPath = dllConfig.path;

// Get environment variables to inject into our app.
const env = getClientEnvironment('');

module.exports = {
  context: process.cwd(),
  entry: dllPlugin.entry(appPackage),
  devtool: 'eval',
  output: {
    filename: '[name].dll.js',
    path: outputPath,
    library: '[name]'
  },
  resolve: {
    alias: {
      // Support React Native Web
      // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
      'react-native': 'react-native-web',
      'react': path.resolve(__dirname, '../node_modules', 'react'),
    }
  },
  plugins: [
    // Add module names to factory functions so they appear in browser profiler.
    new webpack.NamedModulesPlugin(),
    // Makes some environment variables available to the JS code, for example:
    // if (process.env.NODE_ENV === 'development') { ... }. See `./env.js`.
    new webpack.DefinePlugin(env.stringified),
    new webpack.DllPlugin({
      name: '[name]',
      path: path.join(outputPath, '[name].json')
    })
  ],
  target: 'web', // Make web variables accessible to webpack, e.g. window
  performance: {
    hints: false
  }
};
