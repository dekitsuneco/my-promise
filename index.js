/* eslint-disable no-console */
// eslint-disable-next-line import/extensions
import MyPromise from './MyPromise.mjs';

console.log('Before promise');

const p = new MyPromise((resolve, reject) => {
  console.log('Call in executor');

  setTimeout(() => resolve(1), 3000);
})
  .then((v) => {
    console.log(`Call in ${v} then`);

    return ++v;
  })
  .then((v) => {
    console.log(`Call in ${v} then`);

    return ++v;
  })
  .then((v) => {
    console.log(`Call in ${v} then`);

    console.info('Error will raise here');
    throw new Error('First error');
  })
  .catch((err) => {
    console.log('Call in 1st catch');

    console.info('The same error will be passed ahead');
    throw err;
  })
  .catch((err) => {
    console.log('Call in 2nd catch');
  })
  .then((v) => {
    console.log(`Call in then after catch. Value is ${v}`);
  })
  .finally(() => {
    console.log('Call in finally');
    throw new Error('Inside finally');
  });

console.log('After promise');
