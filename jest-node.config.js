var baseConfig = require('./jest-base.config');

module.exports = {
  ...baseConfig,
  displayName: {
    name: 'NODE',
    color: 'red',
  },
  testMatch: [
    `${process.env.APP}/src/**/__test?(s)__/**/*.test.node.(j|t)s?(x)`,
  ],
  testEnvironment: 'node',
};
