module.exports = {
  roots: ['application', 'packages'],
  collectCoverageFrom: [
    `${process.env.APP}/src/**/*.{js,jsx,ts,tsx}`,
    `!${process.env.APP}/src/**/__tests__/*`,
    `!${process.env.APP}/src/**/*.d.ts`
  ],
  coverageThreshold: require('./config/coverage-threshold.json'),
  coverageReporters: ['lcov', 'text-summary', 'json-summary'],
  setupFiles: ['<rootDir>/config/polyfills.js', '<rootDir>/config/enzymeTestAdapterSetup.js'],
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
    '^@/(.*)$': `<rootDir>/application/src/$1`,
    '^#/(.*)$': '<rootDir>/demo/src/$1',
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
    'mjs'
  ],
  globals: {
    'ts-jest': {
      tsConfigFile: 'tsconfig.test.json'
    }
  }
};
