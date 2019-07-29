const baseConfig = require('./jest-base.config');

module.exports = {
  ...baseConfig,
  testMatch: [
    `${process.env.APP}/src/**/__test?(s)__/**/*.test.node.(j|t)s?(x)`
  ],
  setupFiles: [
    '<rootDir>/config/node/polyfills.js',
  ],
  setupFilesAfterEnv: ['<rootDir>/config/node/setupTest.js'],
  testEnvironment: 'node'
};
