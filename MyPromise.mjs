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
          this.resolve.bind(this),
          this.reject.bind(this),
        );
      } catch (error) {
        this.reject(error);
      }
    }
  }
}
