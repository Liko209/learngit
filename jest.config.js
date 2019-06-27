var baseConfig = require('./jest-base.config');

module.exports = {
  ...baseConfig,

  projects: [
    '<rootDir>/jest-default.config.js',
    '<rootDir>/jest-node.config.js',
    '<rootDir>/jest-electron.config.js',
  ],
};
