export const STATE = {
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected',
};

const isFunction = (maybeFunc) => typeof maybeFunc === 'function';

export class MyPromise {
  constructor(executor) {
    this.#state = STATE.PENDING;

    this.#value = undefined;
    this.#reason = undefined;

    this.#thenHandlersQueue = [];

    if (isFunction(executor)) {
      try {
        executor(this.#resolveWith.bind(this), this.#rejectWith.bind(this));
      } catch (error) {
        this.#rejectWith(error);
      }
    }
  }

  #resolveWith(value) {
    if (this.#state === STATE.PENDING) {
      this.#state = STATE.FULFILLED;
      this.#value = value;
    }
  }

  #rejectWith(reason) {
    if (this.#state === STATE.PENDING) {
      this.#state = STATE.REJECTED;
      this.#reason = reason;
    }
  }

  then(onFulfilledHandler, onRejectedHandler) {
    const childPromise = new MyPromise();
    this.#thenHandlersQueue.push([
      childPromise,
      onFulfilledHandler,
      onRejectedHandler,
    ]);

    // If already settled:
    if (this.#state === STATE.FULFILLED) {
      this.#propagateWithFulfilled();
    } else if (this.#state === STATE.REJECTED) {
      this.#propagateWithRejected();
    }

    return childPromise;
  }

  #propagateWithFulfilled() {
    this.#thenHandlersQueue.forEach(([childPromise, onFulfilledHandler]) => {
      if (isFunction(onFulfilledHandler)) {
        const returnedFromThen = onFulfilledHandler(this.#value);

        if (isThenable(returnedFromThen)) {
          // If the promise was returned,
          // then we resolve child promise in then callbacks of the returned promise:
          returnedFromThen.then(
            value => childPromise.#resolveWith(value),
            reason => childPromise.#rejectWith(reason),
          );
        } else {
          childPromise.#resolveWith(returnedFromThen);
        }
      } else {
        return childPromise.#resolveWith(this.#value);
      }
    });

    this.#thenHandlersQueue = [];
  }

  #propagateWithRejected() {}
}
