const baseConfig = require('./jest-default.config');

module.exports = {
  ...baseConfig,
  displayName: {
    name: 'INTEGRATION',
    color: 'green',
  },
  testMatch: [`${process.env.APP}/src/**/__test?(s)__/**/*.test.it.(j|t)s?(x)`],
  setupFiles: [
    ...baseConfig.setupFiles,
    '<rootDir>/config/setupIntegration.js',
  ],
};
