const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  testMatch: [`**/*/__tests__/snapshot/storyshots.test.jsx`],
  testPathIgnorePatterns: ['/node_modules/', 'build'],
};
