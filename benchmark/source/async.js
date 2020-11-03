export {
  any,
  alternatives,
  array,
  boolean,
  binary,
  date,
  func,
  number,
  object,
  string,
  ref,
  isRef,
} from 'joi';

function isContextOnlyKey(key) {
  return key === 'params';
}

const validator = (schema, opts) => async (ctx, next) => {
  const keys = Object.keys(schema);
  for (let i = 0, len = keys.length; i < len; i++) {
    const key = keys[i];
    const source = isContextOnlyKey(key) ? ctx : ctx.request;
    /* eslint-disable-next-line no-await-in-loop */
    const validated = await schema[key].validateAsync(
      source[key],
      opts
    );
    Object.defineProperty(source, [key], {
      get() {
        return validated;
      },
    });
  }
  await next();
};

export default validator;
