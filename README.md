# koa-context-validator

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Dependency Status][david_img]][david_site]

> A robust context validator for koajs. Use `Joi` behind the scenes.


## Install

```
$ npm install koa-context-validator
```

## Usage

#### validate query

```js
import Koa from 'koa';
import validator, {
  object,
  string,
} from 'koa-context-validator';

const app = new Koa();

app.use(validator({
  query: object().keys({
    username: string().required(),
  }),
}));
```

#### validate body

```js
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import validator, {
  object,
  string,
  number,
} from 'koa-context-validator';

const app = new Koa();

app.use(bodyParser());
app.use(validator({
  body: object().keys({
    username: string().required(),
    age: number().required(),
  }),
}));
```

#### validate headers

```js
import Koa from 'koa';
import validator, {
  object,
  string,
} from 'koa-context-validator';

const app = new Koa();

app.use(validator({
  headers: object().keys({
    username: string().required(),
  }).unknown(),
}));
```

#### with koa-compose

```js
import Koa from 'koa';
import compose from 'koa-compose';
import validator, {
  object,
  string,
} from 'koa-context-validator';

const app = new Koa();

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
```

#### with koa-mount

```js
import Koa from 'koa';
import mount from 'koa-mount';
import validator, {
  object,
  string,
} from 'koa-context-validator';

const app = new Koa();

app.use(mount('/api', validator({
  query: object().keys({
    username: string().required(),
  }),
})));
```

#### with koa-router

```js
import Koa from 'koa';
import Router from 'koa-router';
import validator, {
  object,
  string,
} from 'koa-context-validator';

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
app.use(router.middleware());
```

#### stripUnknown

```js
import Koa from 'koa';
import validator, {
  object,
  string,
} from 'koa-context-validator';

app.use(validator({
  query: object().keys({
    username: string().required(),
  }),
}, { stripUnknown: true }));
```

## Koa 1.x

Use `convert.back` from `koa-convert`.

```js
import koa from 'koa'; // koa 1.x
import convert from 'koa-convert';
import validator, {
  object,
  string,
} from 'koa-context-validator';

const app = koa();

app.use(convert.back(validator({
  query: object().keys({
    username: string().required(),
  }),
})));
```

## API

### validator(schema, options?)

#### schema

*Required*
Type: `object`

A object which has optional `query`, `body`, `headers` and `params` schema to validate.

#### options

Just be passed to Joi's validate function as options:

https://github.com/hapijs/joi/blob/master/API.md#validatevalue-schema-options-callback.

### Joi
### any
### alternatives
### array
### boolean
### binary
### date
### func
### number
### object
### string
### ref
### isRef

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
