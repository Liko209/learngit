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
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = async ({ config }) => ({
  ...config,
  module: {
    ...config.module,
    rules: [
      ...config.module.rules,
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
        test: /\.tsx?$/,
        include: path.resolve(__dirname, '../src'),
        use: [
          {
            loader: 'ts-loader',
            options: {
              // disable type checker - we will use it in fork plugin
              transpileOnly: true,
            },
          },
          {
            loader: 'react-docgen-typescript-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    ...config.plugins,
    new CopyWebpackPlugin([
      { from: '../../application/public/theme/', to: 'theme' },
    ]),
    new ForkTsCheckerWebpackPlugin({
      checkSyntacticErrors: true,
    }),
    new webpack.ProvidePlugin({
      'window.Quill': 'quill/dist/quill.js',
      Quill: 'quill/dist/quill.js',
    }),
  ],
  resolve: {
    ...config.resolve,
    plugins: [
      new TsconfigPathsPlugin({
        configFile: path.resolve(__dirname, '../tsconfig.json'),
      }),
    ],
    extensions: [...(config.resolve.extensions || []), '.ts', '.tsx'],
  },
});
