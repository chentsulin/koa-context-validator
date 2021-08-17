import request from 'supertest';
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import mount from 'koa-mount';
import compose from 'koa-compose';

import validator, { Joi, ref } from '..';

const setup = (middlewareArray) => {
  const app = new Koa();

  middlewareArray.forEach((middleware) => {
    app.use(middleware);
  });

  return app;
};

describe('should pass when value is valid', () => {
  it('query', async () => {
    let query;

    const app = setup([
      validator({
        query: Joi.object().keys({
          username: Joi.string().required(),
        }),
      }),
      (ctx) => {
        query = ctx.request.query;
      },
    ]);

    await request(app.callback())
      .get('/')
      .query({
        username: 'Peter',
      });

    expect(query).toEqual({
      username: 'Peter',
    });
  });

  it('body', async () => {
    let body;

    const app = setup([
      bodyParser(),
      validator({
        body: Joi.object().keys({
          username: Joi.string().required(),
          age: Joi.number().required(),
        }),
      }),
      (ctx) => {
        body = ctx.request.body;
      },
    ]);

    await request(app.callback())
      .post('/')
      .send({
        username: 'Peter',
        age: 18,
      });

    expect(body).toEqual({
      username: 'Peter',
      age: 18,
    });
  });

  it('headers', async () => {
    let headers;

    const app = setup([
      validator({
        headers: Joi.object().keys({
          username: Joi.string().required(),
        }).unknown(),
      }),
      (ctx) => {
        headers = ctx.request.headers;
      },
    ]);

    await request(app.callback())
      .get('/')
      .set('username', 'Peter');

    expect(headers).toHaveProperty('username', 'Peter');
  });
});

describe('should throw when value is invalid', () => {
  it('query', async () => {
    let error;

    const app = setup([
      async (ctx, next) => {
        try {
          await next();
        } catch (err) {
          error = err;
        }
      },
      validator({
        query: Joi.object().keys({
          username: Joi.string().required(),
        }),
      }),
    ]);

    await request(app.callback())
      .get('/');

    expect(error.name).toBe('ValidationError');
    expect(error.message).toBe('"username" is required');
  });

  it('body', async () => {
    let error;

    const app = setup([
      async (ctx, next) => {
        try {
          await next();
        } catch (err) {
          error = err;
        }
      },
      bodyParser(),
      validator({
        body: Joi.object().keys({
          username: Joi.string().required(),
        }),
      }),
    ]);

    await request(app.callback())
      .post('/');

    expect(error.name).toBe('ValidationError');
    expect(error.message).toBe('"username" is required');
  });

  it('headers', async () => {
    let error;

    const app = setup([
      async (ctx, next) => {
        try {
          await next();
        } catch (err) {
          error = err;
        }
      },
      validator({
        headers: Joi.object().keys({
          username: Joi.string().required(),
        }).unknown(),
      }),
    ]);

    await request(app.callback())
      .get('/');

    expect(error.name).toBe('ValidationError');
    expect(error.message).toBe('"username" is required');
  });
});

describe('stripUnknown', () => {
  it('should pass only valid value when stripUnknown is true', async () => {
    let body;

    const app = setup([
      bodyParser(),
      validator({
        body: Joi.object().keys({
          username: Joi.string().required(),
          age: Joi.number().required(),
        }),
      }, { stripUnknown: true }),
      (ctx) => {
        body = ctx.request.body;
      },
    ]);

    await request(app.callback())
      .post('/')
      .send({
        username: 'Peter',
        age: 18,
        isActive: true,
      });

    expect(body).toEqual({
      username: 'Peter',
      age: 18,
    });
  });
});

describe('context', () => {
  it('should merge Koa context into context option', async () => {
    let body;

    const app = setup([
      async (ctx, next) => {
        ctx.defaultAge = 42;
        await next();
      },
      bodyParser(),
      validator({
        body: Joi.object().keys({
          username: Joi.string().default(ref('$defaultUsername')),
          age: Joi.number().default(ref('$defaultAge')),
        }),
      }, {
        context: { defaultUsername: 'anonymous' },
      }),
      (ctx) => {
        body = ctx.request.body;
      },
    ]);

    await request(app.callback())
      .post('/')
      .send({});

    expect(body).toEqual({
      username: 'anonymous',
      age: 42,
    });
  });
});

describe('koa-mount', () => {
  it('should work together', async () => {
    let error;

    const app = setup([
      async (ctx, next) => {
        try {
          await next();
        } catch (err) {
          error = err;
        }
      },
      mount('/api', validator({
        query: Joi.object().keys({
          username: Joi.string().required(),
        }),
      })),
    ]);

    await request(app.callback())
      .get('/api');

    expect(error.name).toBe('ValidationError');
    expect(error.message).toBe('"username" is required');
  });
});

describe('koa-compose', () => {
  it('should work together', async () => {
    let body;

    const app = setup([
      compose([
        validator({
          query: Joi.object().keys({
            username: Joi.string().required(),
          }),
        }),
        async (ctx) => {
          body = ctx.request.query;
        },
      ]),
    ]);

    await request(app.callback())
      .get('/')
      .query({
        username: 'Peter',
      });

    expect(body).toEqual({
      username: 'Peter',
    });
  });
});

describe('koa-router', () => {
  it('should work with routing', async () => {
    let body;

    const router = new Router();
    router.get(
      '/api',
      validator({
        query: Joi.object().keys({
          username: Joi.string().required(),
        }),
      }),
      async (ctx) => {
        body = ctx.request.query;
      },
    );

    const app = setup([router.middleware()]);

    await request(app.callback())
      .get('/api')
      .query({
        username: 'Peter',
      });

    expect(body).toEqual({
      username: 'Peter',
    });
  });

  describe('params', () => {
    it('should pass when value is valid', async () => {
      let params;

      const router = new Router();
      router.get(
        '/api/:username',
        validator({
          params: Joi.object().keys({
            username: Joi.string().required(),
          }),
        }),
        async (ctx) => {
          params = ctx.params;
        },
      );

      const app = setup([router.middleware()]);

      await request(app.callback())
        .get('/api/Peter');

      expect(params).toEqual({
        username: 'Peter',
      });
    });

    it('should throw when value is invalid', async () => {
      const router = new Router();
      router.get(
        '/api/:username',
        validator({
          params: Joi.object().keys({
            username: Joi.string().min(1).max(4).required(),
          }),
        }),
        async (ctx) => {
          ctx.body = ctx.params;
        },
      );

      let error;
      const app = setup([
        async (ctx, next) => {
          try {
            await next();
          } catch (err) {
            error = err;
          }
        },
        router.middleware(),
      ]);

      await request(app.callback())
        .get('/api/Peter');

      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe(
        '"username" length must be less than or equal to 4 characters long',
      );
    });
  });
});
