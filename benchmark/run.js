/* eslint-disable no-console */
/*
 *
 * node run.js 10
 *
 */
const {
  object,
  string,
} = require('joi');
const async = require('./build/async').default; // eslint-disable-line import/no-unresolved
const promise = require('./build/promise').default; // eslint-disable-line import/no-unresolved

const schema = {
  body: object().keys({
    name: string().required(),
    tel: string().required(),
    addr: string().required(),
    email: string().email().required(),
  }),
};

const options = { stripUnknown: true };

const asyncMiddleware = async(schema, options);
const promiseMiddleware = promise(schema, options);

const ctx = {
  request: {
    body: {
      name: 'CPH',
      tel: '0912345678',
      addr: '..',
      email: 't@t.t',
    },
  },
};

const ROUND = +process.argv[2] || 100;

const format = ms => {
  let remain = ms;
  let formated = '';

  formated = `${ms % 1000}ms`;
  remain = Math.round(remain / 1000);
  if (remain < 1) return formated;

  formated = `${remain % 60}sec ${formated}`;
  remain = Math.round(remain / 60);
  if (remain < 1) return formated;

  formated = `${remain % 60}min ${formated}`;
  remain = Math.round(remain / 60);
  if (remain < 1) return formated;

  formated = `${remain % 24}hr ${formated}`;
  remain = Math.round(remain / 24);
  if (remain < 1) return formated;

  formated = `${remain}day ${formated}`;
  return formated;
};

console.log(`${ROUND} rounds to run..`);

const results = [[], []];

let p = Promise.resolve();

p.then(() => {
  console.log('Start to run async function...');
});

for (let i = 0; i < ROUND; i++) {
  let start;
  p = p
    .then(() => {
      start = Date.now();
    })
    .then(() => asyncMiddleware(ctx, () => Promise.resolve()))
    .then(() => {
      results[0].push(Date.now() - start);
    });
}

p.then(() => {
  console.log('Start to run promise function...');
});

for (let i = 0; i < ROUND; i++) {
  let start;
  p = p
    .then(() => {
      start = Date.now();
    })
    .then(() => promiseMiddleware(ctx, () => Promise.resolve()))
    .then(() => {
      results[1].push(Date.now() - start);
    });
}

p
.then(() => {
  console.log(results[0].map(format));
  const asyncSum = results[0].reduce((acc, next) => acc + next, 0);
  console.log('async Average: ', format(asyncSum / ROUND));
  console.log(results[1].map(format));
  const promiseSum = results[1].reduce((acc, next) => acc + next, 0);
  console.log('promise Average: ', format(promiseSum / ROUND));

  process.exit(0);
})
.catch(err => {
  console.error(err);
  process.exit(1);
});
