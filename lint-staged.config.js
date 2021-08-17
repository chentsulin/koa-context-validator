module.exports = {
  '*package.json': ['prettier-package-json --write'],
  '*.js': ['eslint --fix', 'prettier --write'],
  '*.(md|json|yml)': ['prettier --write'],
};
