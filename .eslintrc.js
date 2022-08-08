module.exports = {
  root: true,
  'env': {
    'commonjs': true,
    'es2020': true,
    'node': true,
    'mocha': true,
  },
  'extends': ['eslint:recommended', 'plugin:mocha/recommended', 'plugin:prettier/recommended'],
  'parserOptions': {
    'ecmaVersion': 11
  },
};
