// you can use this file to add your custom webpack plugins, loaders and anything you like.
// This is just the basic way to add additional webpack configurations.
// For more information refer the docs: https://storybook.js.org/configurations/custom-webpack-config

// IMPORTANT
// When you add this file, we won't add the default configurations which is similar
// to "React Create App". This only has babel loader to load JavaScript.
const path = require("path");
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const HappyPack = require('happypack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = (baseConfig, env, config) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    include: path.resolve(__dirname, "../src"),
    loader: 'happypack/loader?id=ts',
  });

  config.plugins.push(
    new HappyPack({
      id: 'ts',
      // 3) re-add the loaders you replaced above in #1:
      loaders: [
        {
          path: 'ts-loader',
          query: { happyPackMode: true }
        },
        {
          path: 'react-docgen-typescript-loader',
        }
      ]
    })
  );
  config.plugins.push(
    new ForkTsCheckerWebpackPlugin({
      checkSyntacticErrors: true
    })
  );
  config.resolve.plugins = [
    new TsconfigPathsPlugin({ configFile: path.resolve(__dirname, "../tsconfig.json") }),
  ];
  config.resolve.extensions.push('.ts', '.tsx');
  return config;
};
