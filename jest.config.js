module.exports = {
  projects: [
    '<rootDir>/jest-default.config.js',
    '<rootDir>/jest-node.config.js',
    // Skip electron tests since there are some problems in pipeline
    // '<rootDir>/jest-electron.config.js'
  ],
};
