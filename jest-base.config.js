process.env.APP =
  process.env.APP ||
  '<rootDir>/(application|packages/sdk|packages/jui|packages/foundation|packages/voip|packages/framework|tests/shield)';

module.exports = {
  roots: ['application', 'packages', 'tests/shield'],
  collectCoverageFrom: [
    `${process.env.APP}/src/**/*.(js|jsx|ts|tsx)`,
    `!${process.env.APP}/src/**/__tests__/**/*`,
    `!${process.env.APP}/src/**/*.d.ts`,
    `!${process.env.APP}/src/**/*.View.tsx`,
    '!<rootDir>/packages/jui/**/*',
    '!<rootDir>/packages/rcui/**/*',
    '!<rootDir>/tests/shield/**/*',
    `!${process.env.APP}/src/**/phoneParser.js`, // this is a C++ lib generated by emscripten
  ],
  coverageThreshold: require('./config/coverage-threshold.json'),
  coverageReporters: ['lcov', 'text-summary', 'json-summary', 'clover'],
  testURL: 'http://localhost',
  transform: {
    '^.+\\.(jsx?|tsx?)$': '<rootDir>/config/jest/typescriptTransform.js',
    '^.+\\.css$': '<rootDir>/config/jest/cssTransform.js',
    '^(?!.*\\.(js|jsx|mjs|css|json)$)':
      '<rootDir>/config/jest/fileTransform.js',
  },
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs)$'],
  moduleNameMapper: {
    '^react-native$': 'react-native-web',
    '^@/(.*)$': '<rootDir>/application/src/$1',
    '^foundation/(?!src)(.*)$': '<rootDir>/packages/foundation/src/$1',
    '^sdk/(.*)$': '<rootDir>/packages/sdk/src/$1',
    '^jui/(.*)$': '<rootDir>/packages/jui/src/$1',
    '^rcui/(.*)$': '<rootDir>/packages/rcui/src/$1',
    '^shield/(.*)$': '<rootDir>/tests/shield/src/$1',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/config/jest/__mocks__/fileMock.js',
    '\\.(css|less)$': '<rootDir>/config/jest/__mocks__/cssMock.js',
  },
  modulePathIgnorePatterns: [`${process.env.APP}/build`],
  moduleFileExtensions: [
    'web.ts',
    'ts',
    'web.tsx',
    'tsx',
    'web.js',
    'js',
    'web.jsx',
    'jsx',
    'json',
    'node',
    'mjs',
    'd.ts',
  ],
  globals: {
    'ts-jest': {
      tsConfigFile: 'tsconfig.test.json',
      babelConfig: {
        plugins: ['require-context-hook'],
      },
    },
  },
};
