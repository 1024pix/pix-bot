'use strict';

module.exports = {
  extends: [
    '@1024pix',
    'plugin:mocha/recommended',
    'plugin:prettier/recommended',
    'plugin:chai-expect/recommended',
    'plugin:n/recommended',
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
  parser: '@babel/eslint-parser',
  globals: {
    include: true,
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
    'n/no-unpublished-import': [
      'error',
      {
        allowModules: [
          'chai',
          'chai-nock',
          'sinon',
          'sinon-chai',
          'mocha',
          'proxyquire',
          'nock',
          'fs-extra',
          'simple-git',
          'http-status-codes',
        ],
      },
    ],
  },
};
