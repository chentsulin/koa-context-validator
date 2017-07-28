import { validate as _validate } from 'joi';
import thenify from 'thenify';

const validate = thenify(_validate);

export {
  default as Joi,
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

const validator = (schema, opts_) => (ctx, next) => {
  const opts = Object.assign({}, opts_);
  opts.context = Object.assign({}, ctx, opts.context);
  const keys = Object.keys(schema);
  const promises = [];
  for (let i = 0, len = keys.length; i < len; i++) {
    const key = keys[i];
    const source = isContextOnlyKey(key) ? ctx : ctx.request;
    promises.push(validate( // eslint-disable-line no-param-reassign
      source[key],
      schema[key],
      opts
    ).then(validated => {
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
