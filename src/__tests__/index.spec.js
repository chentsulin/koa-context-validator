/* eslint no-unused-expressions: 0 */
import { expect } from 'chai';
import request from 'supertest';
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import mount from 'koa-mount';
import compose from 'koa-compose';
import Joi_ from 'joi';

import validator, { Joi, ref } from '..';

const setup = middlewareArray => {
  const app = new Koa();

  middlewareArray.forEach(middleware => {
    app.use(middleware);
  });

  return app.listen();
};

it('should export Joi', () => {
  expect(Joi).to.equal(Joi_);
  expect(ref).to.exist;
});

describe('should pass when value is valid', () => {
  it('query', async () => {
    let query;

    const server = setup([
      validator({
        query: Joi.object().keys({
          username: Joi.string().required(),
        }),
      }),
      ctx => {
        query = ctx.request.query;
      }
    ]);

    await request(server)
      .get('/')
      .query({
        username: 'Peter',
      });
    server.close();

    expect(query).to.deep.equal({
      username: 'Peter',
    });
  });

  it('body', async () => {
    let body;

    const server = setup([
      bodyParser(),
      validator({
        body: Joi.object().keys({
          username: Joi.string().required(),
          age: Joi.number().required(),
        }),
      }),
      ctx => {
        body = ctx.request.body;
      }
    ]);

    await request(server)
      .post('/')
      .send({
        username: 'Peter',
        age: 18,
      });
    server.close();

    expect(body).to.deep.equal({
      username: 'Peter',
      age: 18,
    });
  });

  it('headers', async () => {
    let headers;

    const server = setup([
      validator({
        headers: Joi.object().keys({
          username: Joi.string().required(),
        }).unknown(),
      }),
      ctx => {
        headers = ctx.request.headers;
      }
    ]);

    await request(server)
      .get('/')
      .set('username', 'Peter');
    server.close();

    expect(headers).to.have.property('username').and.equal('Peter');
  });
});

describe('should throw when value is invalid', () => {
  it('query', async () => {
    let error;

    const server = setup([
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
      })
    ]);

    await request(server)
      .get('/');
    server.close();

    expect(error.name).to.equal('ValidationError');
    expect(error.message).to.equal('"username" is required');
  });

  it('body', async () => {
    let error;

    const server = setup([
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
      })
    ]);

    await request(server)
      .post('/');
    server.close();

    expect(error.name).to.equal('ValidationError');
    expect(error.message).to.equal('"username" is required');
  });

  it('headers', async () => {
    let error;

    const server = setup([
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
      })
    ]);

    await request(server)
      .get('/');
    server.close();

    expect(error.name).to.equal('ValidationError');
    expect(error.message).to.equal('"username" is required');
  });
});

describe('stripUnknown', () => {
  it('should pass only valid value when stripUnknown is true', async () => {
    let body;

    const server = setup([
      bodyParser(),
      validator({
        body: Joi.object().keys({
          username: Joi.string().required(),
          age: Joi.number().required(),
        }),
      }, { stripUnknown: true }),
      ctx => {
        body = ctx.request.body;
      }
    ]);

    await request(server)
      .post('/')
      .send({
        username: 'Peter',
        age: 18,
        isActive: true,
      });
    server.close();

    expect(body).to.deep.equal({
      username: 'Peter',
      age: 18,
    });
  });
});

describe('context', () => {
  it('should merge Koa context into context option', async () => {
    let body;

    const server = setup([
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
      ctx => {
        body = ctx.request.body;
      }
    ]);

    await request(server)
      .post('/')
      .send({});
    server.close();

    expect(body).to.deep.equal({
      username: 'anonymous',
      age: 42,
    });
  });
});

describe('koa-mount', () => {
  it('should work together', async () => {
    let error;

    const server = setup([
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
      }))
    ]);

    await request(server)
      .get('/api');
    server.close();

    expect(error.name).to.equal('ValidationError');
    expect(error.message).to.equal('"username" is required');
  });
});

describe('koa-compose', () => {
  it('should work together', async () => {
    let body;

    const server = setup([
      compose([
        validator({
          query: Joi.object().keys({
            username: Joi.string().required(),
          }),
        }),
        async ctx => {
          body = ctx.request.query;
        },
      ])
    ]);

    await request(server)
      .get('/')
      .query({
        username: 'Peter',
      });
    server.close();

    expect(body).to.deep.equal({
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
      async ctx => {
        body = ctx.request.query;
      }
    );

    const server = setup([router.middleware()]);

    await request(server)
      .get('/api')
      .query({
        username: 'Peter',
      });
    server.close();

    expect(body).to.deep.equal({
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
        async ctx => {
          params = ctx.params;
        }
      );

      const server = setup([router.middleware()]);

      await request(server)
        .get('/api/Peter');
      server.close();

      expect(params).to.deep.equal({
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
        async ctx => {
          ctx.body = ctx.params;
        }
      );

      let error;
      const server = setup([
        async (ctx, next) => {
          try {
            await next();
          } catch (err) {
            error = err;
          }
        },
        router.middleware()
      ]);

      await request(server)
        .get('/api/Peter');
      server.close();

      expect(error.name).to.equal('ValidationError');
      expect(error.message).to.equal(
        '"username" length must be less than or equal to 4 characters long'
      );
    });
  });
});
