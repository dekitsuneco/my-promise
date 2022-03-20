import {STATE} from './MyPromise.mjs';

// * 1. STATE object:
console.assert(STATE.PENDING === 'pending', 'Pending state is incorrect');
console.assert(STATE.FULFILLED === 'fulfilled', 'Fulfilled state is incorrect');
console.assert(STATE.REJECTED === 'rejected', 'Rejected state is incorrect');
