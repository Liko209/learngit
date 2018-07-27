module.exports = {
  roots: ['demo', 'application', 'packages'],
  collectCoverageFrom: ["src/**/*.{js,jsx,ts,tsx}"],
  setupFiles: ["<rootDir>/config/polyfills.js", '<rootDir>/config/enzymeTestAdapterSetup.js'],
  testMatch: [
    "<rootDir>/**/__tests__/**/*test.(j|t)s?(x)",
    "<rootDir>/**/?(*.)(spec|test).(j|t)s?(x)"
  ],
  testURL: "http://localhost",
  testEnvironment: 'node',
  transform: {
    '^.+\\.(jsx?|tsx?)$': "<rootDir>/config/jest/typescriptTransform.js",
    '^.+\\.css$': '<rootDir>/config/jest/cssTransform.js',
    "^(?!.*\\.(js|jsx|mjs|css|json)$)": "<rootDir>/config/jest/fileTransform.js"
  },
  transformIgnorePatterns: [
    "[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|ts|tsx)$"
  ],
  moduleNameMapper: {
    "^react-native$": "react-native-web",
    '^@/(.*)$': `${process.env.APP}/src/$1`,
  },
  moduleFileExtensions: [
    "web.ts",
    "ts",
    "web.tsx",
    "tsx",
    "web.js",
    "js",
    "web.jsx",
    "jsx",
    "json",
    "node",
    "mjs"
  ],
  globals: {
    "ts-jest": {
      tsConfigFile: "tsconfig.test.json"
    }
  }
};
