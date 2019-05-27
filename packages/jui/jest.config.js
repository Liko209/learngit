module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  verbose: true,
  setupFiles: ['<rootDir>/config/jest/polyfills.js'],
  setupFilesAfterEnv: ['<rootDir>/config/jest/setupTest.js'],
  testPathIgnorePatterns: ['/node_modules/', 'build'],
  testURL: 'http://localhost',
  globals: {
    'ts-jest': {
      diagnostics: false,
      tsConfig: './tsconfig.json',
      babelConfig: {
        plugins: ['require-context-hook'],
      },
    },
  },
  transform: {
    '\\.svg$': 'jest-raw-loader',
  },

  moduleNameMapper: {
    '^rcui/(.*)$': '<rootDir>/node_modules/rcui/src/$1',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/config/jest/__mocks__/fileMock.js',
    '\\.(css|less)$': '<rootDir>/config/jest/__mocks__/cssMock.js',
  },
};
