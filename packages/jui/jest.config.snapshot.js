const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  testMatch: [`**/*/__tests__/snapshot/storyImageShot.test.jsx`],
  testPathIgnorePatterns: ['/node_modules/', 'build'],
};
