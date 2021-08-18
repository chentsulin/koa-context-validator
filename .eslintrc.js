module.exports = {
  parser: 'babel-eslint',
  extends: ['airbnb-base', 'prettier'],
  env: {
    node: true,
    jest: true,
  },
  rules: {
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
  },
};
