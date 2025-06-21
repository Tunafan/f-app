const js = require('@eslint/js')
const vue = require('eslint-plugin-vue')
const globals = require('globals')

module.exports = [
  js.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    files: ['*.vue'],
    languageOptions: {
      parser: require.resolve('vue-eslint-parser'),
      parserOptions: {
        parser: {
          js: require.resolve('@babel/eslint-parser'),
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
  },
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
      ...globals.browser,
      ...globals.node,
      },
    },
    rules: {
      // Example: allow single-word component names
      'vue/multi-word-component-names': 'off',
      'vue/no-unused-vars': 'warn',
      'vue/require-default-prop': 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    },
  },
]
