const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
module.exports = async ({ config }) => ({
  ...config,
  module: {
    ...config.module,
    rules: [
      ...config.module.rules,
      {
        test: /\.ts(x)?$/,
        include: path.resolve(__dirname, '../src'),
        use: [
          {
            loader: 'awesome-typescript-loader',
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
