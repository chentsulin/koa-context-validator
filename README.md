# koa-context-validator

[![npm version](https://badge.fury.io/js/koa-context-validator.svg)](https://npmjs.org/package/koa-context-validator)
[![Build Status](https://github.com/chentsulin/koa-context-validator/workflows/CI/badge.svg?branch=master)](https://github.com/chentsulin/koa-context-validator/actions?query=branch%3Amaster)
[![Coverage Status](https://coveralls.io/repos/github/chentsulin/koa-context-validator/badge.svg?branch=master)](https://coveralls.io/r/chentsulin/koa-context-validator?branch=master)

> A robust context validator for koajs. Use `Joi` behind the scenes.

## Installation

```sh
$ npm install koa-context-validator
```

## Usage

### `query` Validation

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

### `body` Validation

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

### `headers` Validation

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

### With `koa-compose`

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

### With `koa-mount`

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

### With `koa-router`

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

### `stripUnknown`

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
