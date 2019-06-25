/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-08-30 08:41:34
 * Copyright © RingCentral. All rights reserved.
 */
// you can use this file to add your custom webpack plugins, loaders and anything you like.
// This is just the basic way to add additional webpack configurations.
// For more information refer the docs: https://storybook.js.org/configurations/custom-webpack-config

// IMPORTANT
// When you add this file, we won't add the default configurations which is similar
// to "React Create App". This only has babel loader to load JavaScript.
const webpack = require('webpack');
const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');
const excludeNodeModulesExcept = require('./excludeNodeModulesExcept');
const HappyPack = require('happypack');

const moduleRules = [
  {
    test: /\.story\.tsx?$/,
    use: [
      {
        loader: '@storybook/addon-storysource/loader',
        options: { parser: 'typescript' },
      },
    ],
    include: path.resolve(__dirname, '../src'),
    enforce: 'pre',
  },
  {
    test: /\.ts(x)?$/,
    exclude: excludeNodeModulesExcept(['rcui']),
    loader: 'happypack/loader?id=ts',
  },
  {
    test: /\.svg$/,
    include: path.resolve(__dirname, '../src/assets/country-flag'),
    use: [
      {
        loader: 'svg-sprite-loader',
        options: {
          extract: true,
          publicPath: '/static/',
          spriteFilename: 'country-flag-[hash:6].svg',
          symbolId: 'country-flag-[name]',
        },
      },
      {
        loader: 'svgo-loader',
        options: {
          plugins: [
            { removeTitle: true },
            { convertColors: { shorthex: false } },
            { convertPathData: true },
            { reusePaths: true },
          ],
        },
      },
    ],
  },
  {
    test: /\.svg$/,
    include: path.resolve(__dirname, '../src/assets/jupiter-icon'),
    use: [
      {
        loader: 'svg-sprite-loader',
        options: {
          extract: true,
          publicPath: '/static/',
          spriteFilename: 'jupiter-icon-[hash:6].svg',
          symbolId: 'jupiter-[name]',
        },
      },
      {
        loader: 'svgo-loader',
        options: {
          plugins: [
            { removeTitle: true },
            { convertColors: { shorthex: false } },
            { convertPathData: true },
            { reusePaths: true },
          ],
        },
      },
    ],
  },
];

const plugins = [
  new HappyPack({
    id: 'ts',
    threads: 5,
    loaders: [
      {
        loader: 'ts-loader',
        options: { happyPackMode: true, transpileOnly: true },
      },
    ],
  }),
  new CopyWebpackPlugin([
    { from: '../../application/public/theme/', to: 'theme' },
  ]),
  new webpack.ProvidePlugin({
    'window.Quill': 'quill/dist/quill.js',
    Quill: 'quill/dist/quill.js',
  }),
  new SpriteLoaderPlugin(),
];

const resolvePlugins = [
  new TsconfigPathsPlugin({
    configFile: path.resolve(__dirname, '../tsconfig.json'),
  }),
];

const resolveExtensions = ['.ts', '.tsx'];

module.exports = async ({ config }) => {
  // modify the default svg rule
  const fileLoader = config.module.rules[3];
  fileLoader.exclude = [
    path.resolve(__dirname, '../src/assets/country-flag'),
    path.resolve(__dirname, '../src/assets/jupiter-icon'),
  ];

  // Make whatever fine-grained changes you need
  moduleRules.forEach(rule => {
    config.module.rules.push(rule);
  });

  plugins.forEach(plugin => {
    config.plugins.push(plugin);
  });

  config.resolve.plugins = [];
  resolvePlugins.forEach(plugin => {
    config.resolve.plugins.push(plugin);
  });

  resolveExtensions.forEach(ext => {
    config.resolve.extensions.push(ext);
  });

  // Return the altered config
  return config;
};
