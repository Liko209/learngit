module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:jest/recommended',
    'airbnb-typescript',
    'prettier',
    'prettier/@typescript-eslint'
  ],
  plugins: ['react-hooks'],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      modules: true
    }
  },
  root: true,
  env: {
    browser: true,
    es6: true
  },
  rules: {
    '@typescript-eslint/camelcase': 'off',
    'import/named': 'off',
    'import/export': 'off',
    'import/prefer-default-export': 'off',
    'import/no-unresolved': [0, {
      caseSensitive: false
    }],
    'import/no-extraneous-dependencies': 'off',
    'import/order': 'off',
    'import/first': 'error',
    'import/no-cycle': 'off',
    'no-param-reassign': 'off',
    'no-dupe-class-members': 'off',
    'no-new': 'off',
    'no-underscore-dangle': 'off',
    'no-plusplus': 'off',
    'no-shadow': 'off',
    'no-undef': 'off',
    'no-unneeded-ternary': 'off',
    'no-restricted-syntax': 'off',
    'no-return-await': 'off',
    'no-useless-constructor': 'off',
    'no-debugger': 'error',
    'no-alert': 'error',
    'no-useless-return': 'off',
    'no-bitwise': 'off',
    'no-return-assign': 'off',
    'no-empty-function': 'off',
    'no-console': 'error',
    'no-nested-ternary': 'off',
    'no-unused-expressions': 'off',
    'lines-between-class-members': 'off',
    'dot-notation': 'off',
    'prefer-destructuring': 'off',
    'prefer-spread': 'off',
    'func-names': ['error', 'never'],
    'consistent-return': 'off',
    'array-callback-return': 'off',
    'react/no-unescaped-entities': 'off',
    'react/jsx-one-expression-per-line': 'off',
    'react/jsx-curly-brace-presence': 'off',
    'react/sort-comp': 'off',
    'react/jsx-wrap-multilines': 'off',
    'react/jsx-indent': 'off',
    'react/destructuring-assignment': 'off',
    'jsx-a11y/mouse-events-have-key-events': 'off',
    'jsx-quotes': [1, 'prefer-double'],
    'class-methods-use-this': 'off',
    'operator-assignment': 'off',
    'operator-linebreak': 'off',
    "comma-dangle": ["error", "only-multiline"],
    'no-unexpected-multiline': 'off',
    'max-len': ['off', {
      code: 80
    }],
    'implicit-arrow-linebreak': 'off',
    'func-names': 'off'
  },
  settings: {
    react: {
      pragma: 'React',
      version: 'detect'
    },
    'import/ignore': ['node_modules']
  }
};
