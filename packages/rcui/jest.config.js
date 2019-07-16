module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testMatch: [`**/*/__tests__/**/*.test?(s).[jt]s?(x)`],
  verbose: true,
  setupFiles: ['<rootDir>/config/jest/polyfills.js'],
  setupFilesAfterEnv: ['<rootDir>/config/jest/setupTest.js'],
  testPathIgnorePatterns: ['/node_modules/', 'build'],
  snapshotSerializers: ['enzyme-to-json/serializer'],
  testURL: 'http://localhost',
  globals: {
    'ts-jest': {
      diagnostics: false,
      tsConfig: './tsconfig.test.json',
      babelConfig: {
        plugins: ['require-context-hook'],
      },
    },
  },
  modulePathIgnorePatterns: ['<rootDir>/tests/testcafe/'],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/config/jest/__mocks__/fileMock.js',
    '\\.(css|less)$': '<rootDir>/config/jest/__mocks__/cssMock.js',
  },
};
