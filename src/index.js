export { default as Joi, ref } from 'joi';

function isContextOnlyKey(key) {
  return key === 'params';
}

const validator = (schema, opts_) => (ctx, next) => {
  const opts = { ...opts_ };
  opts.context = { ...ctx, ...opts.context };

  const keys = Object.keys(schema);
  const promises = [];

  for (let i = 0, len = keys.length; i < len; i++) {
    const key = keys[i];
    const source = isContextOnlyKey(key) ? ctx : ctx.request;

    promises.push(schema[key].validateAsync(source[key], opts)
      .then((validated) => {
        Object.defineProperty(source, key, {
          get() {
            return validated;
          },
        });
      }));
  }

  return Promise.all(promises).then(next);
};

export default validator;
