module.exports = {
  root: true,
  extends: '@react-native-community',
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'unused-imports'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-shadow': ['error'],
        '@typescript-eslint/no-unused-vars': [
          'error',
          {ignoreRestSiblings: true},
        ],
        'no-shadow': 'off',
        'no-undef': 'off',
        'unused-imports/no-unused-imports': 'error',
        'react-hooks/exhaustive-deps': 'off',
      },
    },
  ],
};
