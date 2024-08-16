/** @type {import('eslint').Linter.Config} */
module.exports = {
    root: true,
    ignorePatterns: ['node_modules/*', 'dist/*'],
    extends: ['airbnb-base', 'eslint:recommended', 'plugin:prettier/recommended', 'prettier'],
    env: {
        node: true,
    },
    parserOptions: {
        ecmaVersion: 'latest',
    },

    overrides: [
        {
            files: ['**/*.ts'],
            plugins: ['import', '@typescript-eslint'],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                project: './tsconfig.json',
                ecmaVersion: 'latest',
            },
            settings: {
                'import/resolver': {
                    typescript: {},
                },
            },
            env: {
                node: true,
            },
            extends: [
                'airbnb-base',
                'airbnb-typescript/base',
                'eslint:recommended',
                'plugin:@typescript-eslint/recommended', // TypeScript rules
                'plugin:prettier/recommended', // Prettier plugin
                'prettier',
            ],
            rules: {
                'prettier/prettier': ['error', {}, { usePrettierrc: true }], // Includes .prettierrc.js rules
                'arrow-body-style': [2, 'as-needed'],
                'comma-dangle': [2, 'always-multiline'],
                curly: [2, 'all'],
                'no-underscore-dangle': 0,
                'import/imports-first': 0,
                'import/no-cycle': [1, { maxDepth: 1 }],
                'import/prefer-default-export': 0,
                'no-warning-comments': [1, { terms: ['todo', 'fixme'], location: 'anywhere' }],
                'class-methods-use-this': 0,
                'max-classes-per-file': 0,
                'no-restricted-syntax': 0,
                'no-await-in-loop': 0,
                'no-nested-ternary': 0,
                'no-console': 0,
                'import/order': [
                    'error',
                    {
                        'newlines-between': 'always',
                        groups: [
                            'builtin', // Built-in types are first
                            'external',
                            'internal',
                            'parent',
                            'sibling',
                        ],
                        alphabetize: { order: 'asc', caseInsensitive: false },
                        warnOnUnassignedImports: false,
                    },
                ],
                'padding-line-between-statements': [
                    'error',
                    { blankLine: 'always', prev: '*', next: 'return' },
                    { blankLine: 'always', prev: '*', next: 'export' },
                ],

                // Why would you want unused vars?
                '@typescript-eslint/no-unused-vars': ['error'],

                // I suggest this setting for requiring return types on functions only where useful
                '@typescript-eslint/explicit-function-return-type': [
                    'warn',
                    {
                        allowExpressions: true,
                        allowConciseArrowFunctionExpressionsStartingWithVoid: true,
                    },
                ],
            },
        },
    ],
};
