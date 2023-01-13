/* eslint-disable quote-props */
module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint',
    // sourceType: 'module',
    ecmaFeatures: {
      legacyDecorators: true
    }
  },
  plugins: [
    'pug',
    'vue'
  ],
  extends: [
    '@nuxtjs',
    'plugin:nuxt/recommended',
    'plugin:vue/strongly-recommended',
    // 'plugin:vue/recommended',
    // 'plugin:vue/essential',
    'standard'
  ],
  rules: {
    'arrow-parens': ['off'],
    'brace-style': ['off'],
    'camelcase': ['off'],
    'comma-spacing': ['off'],
    'curly': ['off'],
    'generator-star-spacing': ['off'],
    'import/order': ['off'],
    'indent': ['off'],
    'key-spacing': ['error', { mode: 'minimum' }],
    'node/no-callback-literal': ['off'],
    'no-console': ['off'],
    'no-empty-pattern': ['off'],
    'no-extend-native': ['off'],
    'no-labels': [1, { allowLoop: true, allowSwitch: true }],
    'no-floating-decimal': ['off'],
    'no-multi-spaces': ['off'],
    'no-return-await': ['off'],
    'no-return-assign': ['off'],
    'no-trailing-spaces': ['error', { skipBlankLines: true }],
    'no-undef': ['off'],
    'one-var': ['off'],
    'nuxt/no-globals-in-created': ['off'],
    'padded-blocks': ['off'],
    'prefer-const': ['off'],
    'prefer-promise-reject-errors': ['error', { allowEmptyReject: true }],
    'space-before-function-paren': ['off'],
    'standard/computed-property-even-spacing': ['off'],
    'standard/object-curly-even-spacing': ['off'],
    'standard/no-callback-literal': ['off'],
    'template-curly-spacing': ['off'],
    'valid-jsdoc': ['off'],
    'vue/max-attributes-per-line': ['off'],
    'vue/attribute-hyphenation': ['off'],
    'vue/attributes-order': ['off'],
    'vue/order-in-components': ['off'],
    'vue/require-default-prop': ['off'],
    'vue/require-prop-types': ['off'],
    'vue/singleline-html-element-content-newline': ['off'],
    'vue/html-closing-bracket-newline': ['off'],
    'vue/html-indent': ['off'],
    'vue/no-mutating-props': ['off'],
    'vue/no-v-html': ['off']
  },
  env: {
    browser: true,
    node: true,
    es6: true
  },
  globals: {
    window: true,
    document: true
  }
}
