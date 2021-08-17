export { default as Joi, ref } from 'joi';

function isKeyOnContext(key) {
  return key === 'params';
}

const validator = (schema, opts_) => async (ctx, next) => {
  const opts = { ...opts_ };
  opts.context = { ...ctx, ...opts.context };

  const keys = Object.keys(schema);
  const promises = [];

  for (let i = 0, len = keys.length; i < len; i++) {
    const key = keys[i];
    const source = isKeyOnContext(key) ? ctx : ctx.request;

    promises.push(
      schema[key].validateAsync(source[key], opts).then((validated) => {
        Object.defineProperty(source, key, {
          get() {
            return validated;
          },
        });
      }),
    );
  }

  await Promise.all(promises);

  return next();
};

export default validator;
