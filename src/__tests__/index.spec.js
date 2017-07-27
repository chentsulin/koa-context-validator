/* eslint no-unused-expressions: 0, no-param-reassign: 0, newline-per-chained-call: 0 */
import { expect } from 'chai';
import request from 'supertest-as-promised';
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import mount from 'koa-mount';
import compose from 'koa-compose';
import Joi_ from 'joi';
import validator, {
  Joi,
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
} from '../';

it('should export Joi types', () => {
  expect(Joi).to.equal(Joi_);
  expect(any).to.exist;
  expect(alternatives).to.exist;
  expect(array).to.exist;
  expect(boolean).to.exist;
  expect(binary).to.exist;
  expect(date).to.exist;
  expect(func).to.exist;
  expect(number).to.exist;
  expect(object).to.exist;
  expect(string).to.exist;
  expect(ref).to.exist;
  expect(isRef).to.exist;
});

describe('should pass when value is valid', () => {
  it('query', async () => {
    const app = new Koa();

    let query;

    app.use(validator({
      query: object().keys({
        username: string().required(),
      }),
    }));

    app.use(ctx => {
      query = ctx.request.query;
    });

    await request(app.listen())
      .get('/')
      .query({
        username: 'Peter',
      });

    expect(query).to.deep.equal({
      username: 'Peter',
    });
  });

  it('body', async () => {
    const app = new Koa();

    let body;

    app.use(bodyParser());
    app.use(validator({
      body: object().keys({
        username: string().required(),
        age: number().required(),
      }),
    }));

    app.use(ctx => {
      body = ctx.request.body;
    });

    await request(app.listen())
      .post('/')
      .send({
        username: 'Peter',
        age: 18,
      });

    expect(body).to.deep.equal({
      username: 'Peter',
      age: 18,
    });
  });

  it('headers', async () => {
    const app = new Koa();

    let headers;

    app.use(validator({
      headers: object().keys({
        username: string().required(),
      }).unknown(),
    }));

    app.use(ctx => {
      headers = ctx.request.headers;
    });

    await request(app.listen())
      .get('/')
      .set('username', 'Peter');

    expect(headers).to.have.property('username').and.equal('Peter');
  });
});

describe('should throw when value is invalid', () => {
  it('query', async () => {
    const app = new Koa();

    let error;
    app.use(async (ctx, next) => {
      try {
        await next();
      } catch (err) {
        error = err;
      }
    });
    app.use(validator({
      query: object().keys({
        username: string().required(),
      }),
    }));

    await request(app.listen())
        .get('/');

    expect(error.name).to.equal('ValidationError');
    expect(error.message).to.equal('child "username" fails because ["username" is required]');
  });

  it('body', async () => {
    const app = new Koa();

    let error;
    app.use(async (ctx, next) => {
      try {
        await next();
      } catch (err) {
        error = err;
      }
    });
    app.use(bodyParser());
    app.use(validator({
      body: object().keys({
        username: string().required(),
      }),
    }));

    await request(app.listen())
      .post('/');

    expect(error.name).to.equal('ValidationError');
    expect(error.message).to.equal('child "username" fails because ["username" is required]');
  });

  it('headers', async () => {
    const app = new Koa();

    let error;
    app.use(async (ctx, next) => {
      try {
        await next();
      } catch (err) {
        error = err;
      }
    });
    app.use(validator({
      headers: object().keys({
        username: string().required(),
      }).unknown(),
    }));

    await request(app.listen())
      .get('/');

    expect(error.name).to.equal('ValidationError');
    expect(error.message).to.equal('child "username" fails because ["username" is required]');
  });
});

describe('stripUnknown', () => {
  it('should pass only valid value when stripUnknown is true', async () => {
    const app = new Koa();

    let body;

    app.use(bodyParser());
    app.use(validator({
      body: object().keys({
        username: string().required(),
        age: number().required(),
      }),
    }, { stripUnknown: true }));

    app.use(ctx => {
      body = ctx.request.body;
    });

    await request(app.listen())
      .post('/')
      .send({
        username: 'Peter',
        age: 18,
        isActive: true,
      });

    expect(body).to.deep.equal({
      username: 'Peter',
      age: 18,
    });
  });
});

describe('context', () => {
  it('should merge Koa context into context option', async () => {
    const app = new Koa();

    let body;

    app.use(async (ctx, next) => {
      ctx.defaultAge = 42;
      await next();
    });

    app.use(bodyParser());
    app.use(validator({
      body: object().keys({
        username: string().default(ref('$defaultUsername')),
        age: number().default(ref('$defaultAge')),
      }),
    }, {
      context: { defaultUsername: 'anonymous' },
    }));

    app.use(ctx => {
      body = ctx.request.body;
    });

    await request(app.listen())
      .post('/')
      .send({});

    expect(body).to.deep.equal({
      username: 'anonymous',
      age: 42,
    });
  });
});

describe('koa-mount', () => {
  it('should work together', async () => {
    const app = new Koa();

    let error;
    app.use(async (ctx, next) => {
      try {
        await next();
      } catch (err) {
        error = err;
      }
    });
    app.use(mount('/api', validator({
      query: object().keys({
        username: string().required(),
      }),
    })));

    await request(app.listen())
        .get('/api');

    expect(error.name).to.equal('ValidationError');
    expect(error.message).to.equal('child "username" fails because ["username" is required]');
  });
});

describe('koa-compose', () => {
  it('should work together', async () => {
    const app = new Koa();

    let body;

    app.use(compose([
      validator({
        query: object().keys({
          username: string().required(),
        }),
      }),
      async ctx => {
        body = ctx.request.query;
      },
    ]));

    await request(app.listen())
      .get('/')
      .query({
        username: 'Peter',
      });

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
        query: object().keys({
          username: string().required(),
        }),
      }),
      async ctx => {
        body = ctx.request.query;
      }
    );

    const app = new Koa();
    app.use(router.middleware());

    await request(app.listen())
      .get('/api')
      .query({
        username: 'Peter',
      });

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
          params: object().keys({
            username: string().required(),
          }),
        }),
        async ctx => {
          params = ctx.params;
        }
      );

      const app = new Koa();
      app.use(router.middleware());

      await request(app.listen())
        .get('/api/Peter');

      expect(params).to.deep.equal({
        username: 'Peter',
      });
    });

    it('should throw when value is invalid', async () => {
      const router = new Router();
      router.get(
        '/api/:username',
        validator({
          params: object().keys({
            username: string().min(1).max(4).required(),
          }),
        }),
        async ctx => {
          ctx.body = ctx.params;
        }
      );

      const app = new Koa();
      let error;
      app.use(async (ctx, next) => {
        try {
          await next();
        } catch (err) {
          error = err;
        }
      });
      app.use(router.middleware());

      await request(app.listen())
        .get('/api/Peter');

      expect(error.name).to.equal('ValidationError');
      expect(error.message).to.equal(
        'child "username" fails because ' +
        '["username" length must be less than or equal to 4 characters long]'
      );
    });
  });
});
