/* eslint-disable no-console */
// eslint-disable-next-line import/extensions
import { STATE, MyPromise } from './MyPromise.mjs';

// * 1. STATE object:
console.assert(STATE.PENDING === 'pending', 'Pending state is incorrect');
console.assert(STATE.FULFILLED === 'fulfilled', 'Fulfilled state is incorrect');
console.assert(STATE.REJECTED === 'rejected', 'Rejected state is incorrect');

// * 2. Promise constructor:
const promise = new MyPromise((resolve) => {
  console.log('Inside executor..');

  console.log('Sync value');
  setTimeout(() => resolve(42), 2000);
});

console.assert(
  typeof promise === 'object',
  'Created instance is not an object',
);
// * 3. Promise chaining:
const child1 = promise.then((v) => {
  console.log('In then..');

  return v + 1;
});
const child2 = promise.then((v) => {
  console.log('In then..');

  return v + 1;
});
const child3 = promise.then((v) => {
  console.log('In then..');

  return v + 1;
});

const child4 = promise.then((v) => {
  console.log('In then..');

  console.log(v);
});

[child1, child2, child3, child4].forEach((child) =>
  console.assert(
    typeof child?.then === 'function',
    'Child promises has no then method',
  ),
);

// * 4. Catch & finally:
let hasCathced = false;
let hasBeenInFinally = false;

new MyPromise(() => {
  throw new Error('Catch me');
})
  .catch((err) => {
    console.assert(err.message === 'Catch me', 'The error is different');
    hasCathced = true;
  })
  .finally(() => {
    console.log('in finally');
    hasBeenInFinally = true;
  });

console.assert(hasCathced, 'The error has not cathed');
console.assert(hasBeenInFinally, 'Did not enter finally');
