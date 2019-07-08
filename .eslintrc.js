
module.exports = {
  parser: "@typescript-eslint/parser",
  extends: ["plugin:react/recommended", "plugin:jest/recommended", "airbnb-typescript", "prettier"],
  plugins: ["react-hooks", "prettier"],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
      modules: true
    },
  },
  root: true,
  env: {
    browser: true,
    es6: true
  },
  rules: {
    "import/no-unresolved": [0, { caseSensitive: false }],
    "@typescript-eslint/indent": "off",
    "@typescript-eslint/camelcase": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "no-underscore-dangle": "off",
    "import/named": "off",
    "import/export": "off",
    "no-undef": "off",
    "import/prefer-default-export": "off",
    "class-methods-use-this": "off",
    "import/no-extraneous-dependencies": "off",
    "no-param-reassign": "off",
    "no-dupe-class-members": "off",
    "no-new": "off",
    "no-plusplus": "off",
    "lines-between-class-members": "off",
    "operator-linebreak": "off",
    "dot-notation": "off",
    "prefer-destructuring": "off",
    "no-unused-expressions": "off",
    "func-names": ["error", "never"],
    "consistent-return": "off",
    "no-useless-constructor": "off",
    "array-callback-return": "off",
    "react/no-unescaped-entities": "off",
    "prefer-spread": "off",
    "no-shadow": "off",
    "operator-assignment": "off",
    "no-unneeded-ternary": "off",
    "import/order": "off",
    "no-restricted-syntax": "off",
    "no-return-await": "off",
    "react/destructuring-assignment": "off",
    "no-bitwise": "off",
    "no-return-assign": "off",
    "no-empty-function": "off",
    'import/first': 'error',
    "import/no-cycle": "off",
    'no-debugger': "error",
    "no-alert": "error",
    "no-useless-return": "off",
    "no-console": "off",
    "no-nested-ternary": "off",
    "react/jsx-one-expression-per-line": "off",
    "react/jsx-curly-brace-presence": "off",
    "react/sort-comp": "off",
    "react/jsx-wrap-multilines": "off",
    "react/jsx-indent": "off",
    "jsx-a11y/mouse-events-have-key-events": "off"
  },
  settings: {
    react: {
      pragma: "React",
      version: "detect"
    },
    "import/ignore": ["node_modules"]
  }
};
