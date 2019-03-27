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
const HappyPack = require('happypack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (baseConfig, env, config) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    include: path.resolve(__dirname, '../src'),
    loader: 'happypack/loader?id=ts',
  });

  config.plugins.push(
    new HappyPack({
      id: 'ts',
      // 3) re-add the loaders you replaced above in #1:
      loaders: [
        {
          path: 'babel-loader',
          query: {
            cacheDirectory: true,
            babelrc: false,
            presets: [['react-app', { flow: false, typescript: true }]],
          },
        },
        {
          path: 'react-docgen-typescript-loader',
        },
      ],
    }),
    new CopyWebpackPlugin([
      { from: '../../application/public/theme/', to: 'theme' },
    ]),
  );
  config.plugins.push(
    new ForkTsCheckerWebpackPlugin({
      checkSyntacticErrors: true,
    }),
    new webpack.ProvidePlugin({
      'window.Quill': 'quill/dist/quill.js',
      Quill: 'quill/dist/quill.js',
    }),
  );
  config.resolve.plugins = [
    new TsconfigPathsPlugin({
      configFile: path.resolve(__dirname, '../tsconfig.json'),
    }),
  ];
  config.resolve.extensions.push('.ts', '.tsx');
  return config;
};
