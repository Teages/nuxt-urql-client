import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: [
    'dist',
    'node_modules',
    'playground/.gql',
  ],
}, {
  rules: {
    'node/prefer-global/process': ['error', 'always'],
    'curly': ['error', 'all'],
  },
}, {
  // conflict with changelogen: remove after https://github.com/unjs/changelogen/issues/170
  files: ['package.json'],
  name: 'teages:changelogen-package-json',
  rules: {
    'style/eol-last': ['error', 'never'],
  },
})
