import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: [],
}, {
  rules: {
    'node/prefer-global/process': ['error', 'always'],
    'curly': ['error', 'all'],
  },
})
