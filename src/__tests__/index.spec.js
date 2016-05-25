/* eslint no-unused-expressions: 0, no-param-reassign: 0 */
import { expect } from 'chai';
import request from 'supertest-as-promised';
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import mount from 'koa-mount';
import compose from 'koa-compose';
import validator, {
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

async function errorHandler(ctx, next) {
  try {
    await next();
  } catch (err) {
    ctx.status = 400;
    ctx.body = {
      error: true,
      name: err.name,
      message: err.message,
    };
  }
}

it('should export Joi types', () => {
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

    app.use(errorHandler);
    app.use(validator({
      query: object().keys({
        username: string().required(),
      }),
    }));

    app.use((ctx) => {
      ctx.body = ctx.request.query;
    });

    const response = await request(app.listen())
      .get('/')
      .query({
        username: 'Peter',
      });

    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal({
      username: 'Peter',
    });
  });

  it('body', async () => {
    const app = new Koa();

    app.use(errorHandler);
    app.use(bodyParser());
    app.use(validator({
      body: object().keys({
        username: string().required(),
        age: number().required(),
      }),
    }));

    app.use((ctx) => {
      ctx.body = ctx.request.body;
    });

    const response = await request(app.listen())
      .post('/')
      .send({
        username: 'Peter',
        age: 18,
      });

    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal({
      username: 'Peter',
      age: 18,
    });
  });

  it('headers', async () => {
    const app = new Koa();

    app.use(errorHandler);
    app.use(validator({
      headers: object().keys({
        username: string().required(),
      }).unknown(),
    }));

    app.use((ctx) => {
      ctx.body = ctx.request.headers;
    });

    const response = await request(app.listen())
      .get('/')
      .set('username', 'Peter');

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('username').and.equal('Peter');
  });
});

describe('should throw when value is invalid', () => {
  it('query', async () => {
    const app = new Koa();

    app.use(errorHandler);
    app.use(validator({
      query: object().keys({
        username: string().required(),
      }),
    }));

    const response = await request(app.listen())
        .get('/');

    expect(response.status).to.equal(400);
    expect(response.body).to.deep.equal({
      error: true,
      name: 'ValidationError',
      message: 'child "username" fails because ["username" is required]',
    });
  });

  it('body', async () => {
    const app = new Koa();

    app.use(errorHandler);
    app.use(bodyParser());
    app.use(validator({
      body: object().keys({
        username: string().required(),
      }),
    }));

    const response = await request(app.listen())
      .post('/');

    expect(response.status).to.equal(400);
    expect(response.body).to.deep.equal({
      error: true,
      name: 'ValidationError',
      message: 'child "username" fails because ["username" is required]',
    });
  });

  it('headers', async () => {
    const app = new Koa();

    app.use(errorHandler);
    app.use(validator({
      headers: object().keys({
        username: string().required(),
      }).unknown(),
    }));

    const response = await request(app.listen())
      .get('/');

    expect(response.status).to.equal(400);
    expect(response.body).to.deep.equal({
      error: true,
      name: 'ValidationError',
      message: 'child "username" fails because ["username" is required]',
    });
  });
});

describe('stripUnknown', () => {
  it('should pass only valid value when stripUnknown is true', async () => {
    const app = new Koa();

    app.use(errorHandler);
    app.use(bodyParser());
    app.use(validator({
      body: object().keys({
        username: string().required(),
        age: number().required(),
      }),
    }, { stripUnknown: true }));

    app.use((ctx) => {
      ctx.body = ctx.request.body;
    });

    const response = await request(app.listen())
      .post('/')
      .send({
        username: 'Peter',
        age: 18,
        isActive: true,
      });

    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal({
      username: 'Peter',
      age: 18,
    });
  });
});

describe('koa-mount', () => {
  it('should work together', async () => {
    const app = new Koa();

    app.use(errorHandler);
    app.use(mount('/api', validator({
      query: object().keys({
        username: string().required(),
      }),
    })));

    const response = await request(app.listen())
        .get('/api');

    expect(response.status).to.equal(400);
    expect(response.body).to.deep.equal({
      error: true,
      name: 'ValidationError',
      message: 'child "username" fails because ["username" is required]',
    });
  });
});

describe('koa-compose', () => {
  it('should work together', async () => {
    const app = new Koa();

    app.use(errorHandler);
    app.use(compose([
      validator({
        query: object().keys({
          username: string().required(),
        }),
      }),
      async (ctx) => {
        ctx.body = ctx.request.query;
      },
    ]));

    const response = await request(app.listen())
      .get('/')
      .query({
        username: 'Peter',
      });

    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal({
      username: 'Peter',
    });
  });
});

describe('koa-router', () => {
  it('should work with routing', async () => {
    const router = new Router();
    router.get(
      '/api',
      validator({
        query: object().keys({
          username: string().required(),
        }),
      }),
      async (ctx) => {
        ctx.body = ctx.request.query;
      }
    );

    const app = new Koa();
    app.use(errorHandler);
    app.use(router.middleware());

    const response = await request(app.listen())
      .get('/api')
      .query({
        username: 'Peter',
      });

    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal({
      username: 'Peter',
    });
  });

  describe('params', () => {
    it('should pass when value is valid', async () => {
      const router = new Router();
      router.get(
        '/api/:username',
        validator({
          params: object().keys({
            username: string().required(),
          }),
        }),
        async (ctx) => {
          ctx.body = ctx.params;
        }
      );

      const app = new Koa();
      app.use(errorHandler);
      app.use(router.middleware());

      const response = await request(app.listen())
        .get('/api/Peter');

      expect(response.status).to.equal(200);
      expect(response.body).to.deep.equal({
        username: 'Peter',
      });
    });

    it('should throw when value is invalid', async () => {
      // body...
    });
  });
});
