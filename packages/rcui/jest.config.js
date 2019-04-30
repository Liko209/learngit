module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  verbose: true,
  setupFiles: [
    '<rootDir>/config/jest/polyfills.js',
    '<rootDir>/config/jest/enzymeTestAdapterSetup.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/config/jest/setupTest.js'],
  testPathIgnorePatterns: ['/node_modules/'],
  snapshotSerializers: ['enzyme-to-json/serializer'],
  testURL: 'http://localhost',
  globals: {
    'ts-jest': {
      tsConfig: './tsconfig.test.json'
    }
  },
  transform: {
    '\\.svg$': 'jest-raw-loader'
  }
};
