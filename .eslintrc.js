module.exports = {
  root: true,
  env: {
    commonjs: true,
    es2020: true,
    node: true,
    mocha: true,
  },
  extends: ['eslint:recommended', 'plugin:mocha/recommended', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 11,
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
