module.exports = (baseConfig, env, config) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    exclude: /node_modules/,
    use: [
      {
        loader: "awesome-typescript-loader"
      },
      {
        loader: "react-docgen-typescript-loader"
      }
    ]
  });
  config.resolve.extensions.push(".ts", ".tsx");
  return config;
};
