import type Koa from 'koa';
import Joi from 'joi';

type InputSchema = {
  query?: Joi.ObjectSchema;
  headers?: Joi.ObjectSchema;
  body?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
};

function isKeyOnContext(key: keyof InputSchema): key is 'params' {
  return key === 'params';
}

type ValidatorContext<ContextT = Koa.DefaultContext> = ContextT & {
  /**
   * url params
   */
  params?: Record<string, string>;
};

const validator =
  <StateT = Koa.DefaultState, ContextT = Koa.DefaultContext>(
    schema: InputSchema,
    options: Joi.AsyncValidationOptions = {},
  ): Koa.Middleware<StateT, ContextT> =>
  async (
    ctx: Koa.ParameterizedContext<StateT, ValidatorContext<ContextT>>,
    next: Koa.Next,
  ): ReturnType<Koa.Next> => {
    const validateOptions = {
      ...options,
      context: {
        ...ctx,
        ...options.context,
      },
    };

    const keys = Object.keys(schema) as (keyof typeof schema)[];
    const promises = keys.map(async (key) => {
      const targetSchema = schema[key];

      if (!targetSchema) return;

      let source:
        | Koa.ParameterizedContext<StateT, ValidatorContext<ContextT>>
        | Koa.Request;
      let value;
      if (isKeyOnContext(key)) {
        source = ctx;
        value = ctx[key];
      } else {
        source = ctx.request;
        value = ctx.request[key];
      }

      const validatedValue = await targetSchema.validateAsync(
        value,
        validateOptions,
      );

      Object.defineProperty(source, key, {
        get() {
          return validatedValue;
        },
      });
    });

    await Promise.all(promises);

    return next();
  };

export { Joi };

export default validator;
