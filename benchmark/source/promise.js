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

const validator = (schema, opts) => (ctx, next) => {
  const keys = Object.keys(schema);
  const promises = [];
  for (let i = 0, len = keys.length; i < len; i++) {
    const key = keys[i];
    const source = isContextOnlyKey(key) ? ctx : ctx.request;
    promises.push(schema[key].validateAsync(
      source[key],
      opts
    ).then(validated => {
      Object.defineProperty(source, [key], {
        get() {
          return validated;
        },
      });
    }));
  }
  return Promise.all(promises).then(() => next());
};

export default validator;
