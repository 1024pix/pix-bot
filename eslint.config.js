import js from '@eslint/js';
import mochaPlugin from 'eslint-plugin-mocha';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import babelParser from '@babel/eslint-parser';
import pluginSyntaxImportAssertions from '@babel/plugin-syntax-import-assertions';

export default [
  js.configs.recommended,
  {
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '_', caughtErrorsIgnorePattern: '_' }],
      'no-var': ['error'],
      'prefer-const': ['error'],
      'no-undef': ['off'],
      'no-console': ['error'],
    },
  },
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          plugins: [pluginSyntaxImportAssertions], // needed for the "import pkg from '../../package.json' with { type: 'json' };" syntax
        },
      },
    },
  },
  eslintPluginPrettierRecommended,
  mochaPlugin.configs.recommended,
  {
    rules: {
      'mocha/no-setup-in-describe': ['off'],
      'mocha/no-exclusive-tests': ['error'],
      'mocha/no-pending-tests': ['error'],
      'mocha/no-hooks-for-single-case': ['off'],
      'mocha/no-top-level-hooks': ['error'],
      'mocha/no-global-tests': ['off'],
      'mocha/consistent-spacing-between-blocks': 'off',
    },
  },
];
