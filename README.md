# koa-context-validator

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Dependency Status][david_img]][david_site]

> A robust context validator for koajs. Use `Joi` behind the scenes.

## Install

```console
$ npm install koa-context-validator
```

## Usage

### validate query

```js
import Koa from 'koa';
import validator, { Joi } from 'koa-context-validator';

const app = new Koa();

app.use(
  validator({
    query: Joi.object().keys({
      username: Joi.string().required(),
    }),
  })
);
```

### validate body

```js
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import validator, { Joi } from 'koa-context-validator';

const app = new Koa();

app.use(bodyParser());
app.use(
  validator({
    body: Joi.object().keys({
      username: Joi.string().required(),
      age: Joi.number().required(),
    }),
  })
);
```

### validate headers

```js
import Koa from 'koa';
import validator, { Joi } from 'koa-context-validator';

const app = new Koa();

app.use(
  validator({
    headers: Joi.object()
      .keys({
        username: Joi.string().required(),
      })
      .unknown(),
  })
);
```

### with koa-compose

```js
import Koa from 'koa';
import compose from 'koa-compose';
import validator, { Joi } from 'koa-context-validator';

const app = new Koa();

app.use(
  compose([
    validator({
      query: Joi.object().keys({
        username: Joi.string().required(),
      }),
    }),
    async (ctx) => {
      ctx.body = ctx.request.query;
    },
  ])
);
```

### with koa-mount

```js
import Koa from 'koa';
import mount from 'koa-mount';
import validator, { Joi } from 'koa-context-validator';

const app = new Koa();

app.use(
  mount(
    '/api',
    validator({
      query: Joi.object().keys({
        username: Joi.string().required(),
      }),
    })
  )
);
```

### with koa-router

```js
import Koa from 'koa';
import Router from 'koa-router';
import validator, { Joi } from 'koa-context-validator';

const router = new Router();
router.get(
  '/api/:username',
  validator({
    params: Joi.object().keys({
      username: Joi.string().required(),
    }),
  }),
  async (ctx) => {
    ctx.body = ctx.params;
  }
);

const app = new Koa();
app.use(router.middleware());
```

### stripUnknown

```js
import Koa from 'koa';
import validator, { Joi } from 'koa-context-validator';

app.use(
  validator(
    {
      query: Joi.object().keys({
        username: Joi.string().required(),
      }),
    },
    { stripUnknown: true }
  )
);
```

## Koa 1.x

Use `convert.back` from `koa-convert`.

```js
import koa from 'koa'; // koa 1.x
import convert from 'koa-convert';
import validator, { Joi } from 'koa-context-validator';

const app = koa();

app.use(
  convert.back(
    validator({
      query: Joi.object().keys({
        username: Joi.string().required(),
      }),
    })
  )
);
```

## API

### validator(schema, options?)

#### schema

_Required_
Type: `object`

A object which has optional `query`, `body`, `headers` and `params` schema to validate.

#### options

Just be passed to Joi's validate function as options:

https://github.com/hapijs/joi/blob/master/API.md#validatevalue-schema-options-callback.

### Joi

### ref

## License

MIT © [C.T. Lin](https://github.com/chentsulin/koa-context-validator)

[npm-image]: https://badge.fury.io/js/koa-context-validator.svg
[npm-url]: https://npmjs.org/package/koa-context-validator
[travis-image]: https://travis-ci.org/chentsulin/koa-context-validator.svg
[travis-url]: https://travis-ci.org/chentsulin/koa-context-validator
[coveralls-image]: https://coveralls.io/repos/github/chentsulin/koa-context-validator/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/r/chentsulin/koa-context-validator?branch=master
[david_img]: https://david-dm.org/chentsulin/koa-context-validator.svg
[david_site]: https://david-dm.org/chentsulin/koa-context-validator
