'use strict';

module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:mocha/recommended',
    'plugin:prettier/recommended',
    'plugin:import/recommended',
    'plugin:import/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    requireConfigFile: false,
    babelOptions: {
      parserOpts: {
        plugins: ['importAssertions'],
      },
    },
  },
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  rules: {
    'mocha/no-setup-in-describe': 'off',
    'mocha/no-exclusive-tests': 'error',
    'mocha/no-pending-tests': 'error',
    'mocha/no-skipped-tests': 'error',
    'mocha/no-hooks-for-single-case': 'off',
    'mocha/no-top-level-hooks': 'error',
    'no-console': 'error',
  },
};
