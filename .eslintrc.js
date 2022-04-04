module.exports = {
  extends: '@loopback/eslint-config',
  rules: {
    "@typescript-eslint/camelCase": 0,
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/naming-convention": 0,
  },
  ignorePatterns: ['config.js']
};
