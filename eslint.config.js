import prettierImport from 'eslint-plugin-prettier';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import globals from 'globals';
import pluginImport from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';
import { globalIgnores } from 'eslint/config';

const compat = new FlatCompat({});

export default tseslint.config([
  globalIgnores(['dist', 'node_modules', 'coverage']),
  {
    settings: {
      'import/resolver': {
        typescript: {}, // this loads root_dir/tsconfig.json to eslint
      },
    },
    languageOptions: {
      ecmaVersion: 2021,
      globals: globals.node,
      sourceType: 'module',
    },
    plugins: {
      prettier: prettierImport,
      import: pluginImport,
    },
    extends: [
      ...tseslint.configs.recommended,
      ...compat.extends(
        'plugin:import/recommended',
        'plugin:import/typescript',
        'plugin:prettier/recommended'
      ),
      js.configs.recommended,
      eslintPluginPrettierRecommended,
    ],
    rules: {
      'prettier/prettier': 'error',
      'import/order': [
        'warn',
        {
          'newlines-between': 'always',
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        },
      ],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
]);
