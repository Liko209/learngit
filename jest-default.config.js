var baseConfig = require('./jest-base.config');

module.exports = {
  ...baseConfig,
  testMatch: [`${process.env.APP}/src/**/__test?(s)__/**/*.test.(j|t)s?(x)`],
  setupFiles: [
    '<rootDir>/config/polyfills.js',
    '<rootDir>/config/enzymeTestAdapterSetup.js'
  ],
  testEnvironment: 'jsdom'
};
