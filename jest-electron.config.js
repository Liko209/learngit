var baseConfig = require('./jest-base.config');

module.exports = {
  ...baseConfig,
  displayName: {
    name: 'ELECTRON',
    color: 'red',
  },
  testMatch: [
    `${process.env.APP}/src/**/__test?(s)__/**/*.test.electron.(j|t)s?(x)`,
  ],
  setupFiles: ['<rootDir>/config/enzymeTestAdapterSetup.js'],
  runner: '@jest-runner/electron',
  testEnvironment: '@jest-runner/electron/environment',
};
