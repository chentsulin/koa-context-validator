import { validate as _validate } from 'joi';
import thenify from 'thenify';

const validate = thenify(_validate);

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
    const validated = await validate( // eslint-disable-line no-param-reassign
      source[key],
      schema[key],
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
