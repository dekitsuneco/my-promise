export const STATE = {
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected',
};

const isFunction = maybeFunc => typeof maybeFunc === 'function';

export class MyPromise {
  constructor(executor) {
    this.#state = STATE.PENDING;

    this.#value = undefined;
    this.#reason = undefined;

    this.#thenHandlersQueue = [];

    if (isFunction(executor)) {
      try {
        executor(
          this.resolveWith.bind(this),
          this.rejectWith.bind(this),
        );
      } catch (error) {
        this.rejectWith(error);
      }
    }
  }

  resolveWith(value) {
    if (this.#state === STATE.PENDING) {
      this.#state = STATE.FULFILLED;
      this.#value = value;
    }
  }

  rejectWith(reason) {
    if (this.#state === STATE.PENDING) {
      this.#state = STATE.REJECTED;
      this.#reason = reason;
    }
  }
}
