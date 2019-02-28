process.env.APP =
  process.env.APP ||
  '<rootDir>/{application|packages/sdk|packages/foundation|packages/voip|packages/jui}';

module.exports = {
  roots: ['application', 'packages'],
  collectCoverageFrom: [
    `${process.env.APP}/src/**/*.{js,jsx,ts,tsx}`,
    `!${process.env.APP}/src/**/__tests__/*`,
    `!${process.env.APP}/src/**/*.d.ts`,
    `!${process.env.APP}/src/**/*.View.tsx`
  ],
  coverageThreshold: require('./config/coverage-threshold.json'),
  coverageReporters: ['lcov', 'text-summary', 'json-summary', 'clover'],
  setupFiles: [
    '<rootDir>/config/polyfills.js',
    '<rootDir>/config/enzymeTestAdapterSetup.js'
  ],
  testMatch: [
    `${process.env.APP}/src/**/__tests__/**/*test.(j|t)s?(x)`,
    `${process.env.APP}/src/**/?(*.)(spec|test).(j|t)s?(x)`
  ],
  testURL: 'http://localhost',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(jsx?|tsx?)$': '<rootDir>/config/jest/typescriptTransform.js',
    '^.+\\.css$': '<rootDir>/config/jest/cssTransform.js',
    '^(?!.*\\.(js|jsx|mjs|css|json)$)': '<rootDir>/config/jest/fileTransform.js'
  },
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|ts|tsx)$'
  ],
  moduleNameMapper: {
    '^react-native$': 'react-native-web',
    '^@/(.*)$': '<rootDir>/application/src/$1',
    '^sdk/(.*)$': '<rootDir>/packages/sdk/src/$1',
    '^jui/(.*)$': '<rootDir>/packages/jui/src/$1'
  },
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
    'd.ts'
  ],
  globals: {
    'ts-jest': {
      tsConfigFile: 'tsconfig.test.json'
    }
  },
  testEnvironment: 'jsdom'
};
