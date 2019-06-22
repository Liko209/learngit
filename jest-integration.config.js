var baseConfig = require('./jest-default.config');

module.exports = {
  ...baseConfig,
  displayName: {
    name: 'INTEGRATION',
    color: 'green',
  },
  testMatch: [`${process.env.APP}/src/**/__test?(s)__/**/*.test.it.(j|t)s?(x)`],
  setupFiles: [
    '<rootDir>/config/polyfills.js',
    '<rootDir>/config/enzymeTestAdapterSetup.js',
    '<rootDir>/config/autoMock.js',
  ],
};
