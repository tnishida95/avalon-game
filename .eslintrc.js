module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint'
  },
  env: {
    browser: true,
  },
  extends: [
    'plugin:vue/essential',
    'eslint:recommended',
    'google'
  ],
  // required to lint *.vue files
  plugins: [
    'vue'
  ],
  // add your custom rules here
  rules: {
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    "no-console": "off",
    "brace-style": "off",
    "keyword-spacing": "off",
    "comma-spacing": "off",
    "comma-dangle": "off",
    "quotes": "off",
    "guard-for-in": "off",
    "max-len": "off",
    "indent": ["error", 2],
    "no-undef": "off"
  }
};
