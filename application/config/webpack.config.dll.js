/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-08-30 11:01:49
 * Copyright © RingCentral. All rights reserved.
 */

/**
 * WEBPACK DLL GENERATOR
 *
 * This profile is used to cache webpack's module
 * contexts for external library and framework type
 * dependencies which will usually not change often enough
 * to warrant building them from scratch every time we use
 * the webpack process.
 */

const { join } = require("path");
const webpack = require("webpack");
const getClientEnvironment = require("./env");
const paths = require("./paths");
const dllPlugin = require("./dll");
const appPackage = require(paths.appPackageJson);

const dllConfig = dllPlugin.defaults;
const outputPath = dllConfig.path;

// Get environment variables to inject into our app.
const env = getClientEnvironment("");

module.exports = {
  mode: "development",
  context: process.cwd(),
  entry: dllPlugin.entry(appPackage),
  devtool: "cheap-module-source-map",
  output: {
    filename: "[name].dll.js",
    path: outputPath,
    library: "[name]"
  },
  plugins: [
    // Add module names to factory functions so they appear in browser profiler.
    new webpack.NamedModulesPlugin(),
    // Makes some environment variables available to the JS code, for example:
    // if (process.env.NODE_ENV === 'development') { ... }. See `./env.js`.
    new webpack.DefinePlugin(env.stringified),
    new webpack.DllPlugin({
      name: "[name]",
      path: join(outputPath, "[name].json")
    })
  ],
  performance: {
    hints: false
  }
};
