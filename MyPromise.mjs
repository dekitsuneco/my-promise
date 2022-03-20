/**
 * Possible states of a promise.
 * @type {{
 * PENDING: string,
 * FULFILLED: string,
 * REJECTED: string
 * }}
 */
const STATE = {
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected',
};

/**
 * Checks if argument is a funciton.
 * @function isFunction
 * @param {any} maybeFunc
 * @returns {boolean}
 */
const isFunction = (maybeFunc) => typeof maybeFunc === 'function';

/**
 * Checks if argument has then method.
 * @function isThenable
 * @param {any} maybePromise
 * @returns {boolean}
 */
const isThenable = (maybePromise) =>
  maybePromise && isFunction(maybePromise.then);

/**
 * Promise class.
 * @class
 */
class MyPromise {
  /**
   * Stores the promise state.
   * @type {string}
   */
  #state;

  /**
   * Stores the value promise resolved with.
   * @type {any}
   */
  #value;

  /**
   * Stores the reason promise rejected with.
   * @type {Error}
   */
  #reason;

  /**
   * Array that stores arrays child promise and then handlers.
   * @type {Array}
   */
  #thenHandlersQueue;

  /**
   * Array that stores arrays of child promise and finally handlers.
   * @type {Array}
   */
  #finallyHandlersQueue;

  /**
   * Constructor of the class.
   * @param {(function|undefined)} executor
   */
  constructor(executor) {
    this.#state = STATE.PENDING;

    this.#value = undefined;
    this.#reason = undefined;

    this.#thenHandlersQueue = [];
    this.#finallyHandlersQueue = [];

    if (isFunction(executor)) {
      try {
        executor(this.#resolveWith.bind(this), this.#rejectWith.bind(this));
      } catch (error) {
        this.#rejectWith(error);
      }
    }
  }

  /**
   * Method called to resolve promise with a value.
   * @param {any} value
   */
  #resolveWith(value) {
    if (this.#state === STATE.PENDING) {
      this.#state = STATE.FULFILLED;
      this.#value = value;

      this.#propagateWithFulfilled();
    }
  }

  /**
   * Method called to reject a promise with an error.
   * @param {Error} reason
   */
  #rejectWith(reason) {
    if (this.#state === STATE.PENDING) {
      this.#state = STATE.REJECTED;
      this.#reason = reason;

      this.#propagateWithRejected();
    }
  }

  /**
   * Method called to pass a value to the next promise.
   * @param {(function|null)} onFulfilledHandler
   * @param {(function|null)} onRejectedHandler
   * @returns {MyPromise}
   */
  then(onFulfilledHandler, onRejectedHandler) {
    const childPromise = new MyPromise();
    this.#thenHandlersQueue.push([
      childPromise,
      onFulfilledHandler,
      onRejectedHandler,
    ]);

    // If already settled:
    try {
      if (this.#state === STATE.FULFILLED) {
        this.#propagateWithFulfilled();
      } else if (this.#state === STATE.REJECTED) {
        this.#propagateWithRejected();
      }
    } catch (error) {
      childPromise.#rejectWith(error);
    }

    return childPromise;
  }

  /**
   * Method called in case of an error.
   * @param {function} onRejectedHandler
   * @returns {MyPromise}
   */
  catch(onRejectedHandler) {
    return this.then(null, onRejectedHandler);
  }

  /**
   * Method called always called after all thens and catches.
   * @param {function} sideEffect
   * @returns {MyPromise}
   */
  finally(sideEffect) {
    if (this.#state !== STATE.PENDING) {
      sideEffect();

      return this.#state === STATE.FULFILLED
        ? new MyPromise().#resolveWith(this.#value)
        : new MyPromise().#rejectWith(this.#reason);
    }

    const childPromise = new MyPromise();
    this.#finallyHandlersQueue.push([childPromise, sideEffect]);

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
            (value) => childPromise.#resolveWith(value),
            (reason) => childPromise.#rejectWith(reason),
          );
        } else {
          childPromise.#resolveWith(returnedFromThen);
        }
      }

      return childPromise.#resolveWith(this.#value);
    });

    this.#finallyHandlersQueue.forEach(([childPromise, sideEffect]) => {
      sideEffect();

      childPromise.#resolveWith(this.#value);
    });

    this.#thenHandlersQueue = [];
    this.#finallyHandlersQueue = [];
  }

  #propagateWithRejected() {
    this.#thenHandlersQueue.forEach(([childPromise, , onRejectedHandler]) => {
      if (isFunction(onRejectedHandler)) {
        const returnedFromThen = onRejectedHandler(this.#reason);

        if (isThenable(returnedFromThen)) {
          returnedFromThen.then(
            (value) => childPromise.#resolveWith(value),
            (reason) => childPromise.#rejectWith(reason),
          );
        } else {
          childPromise.#resolveWith(returnedFromThen);
        }
      }

      return childPromise.#rejectWith(this.#reason);
    });

    this.#finallyHandlersQueue.forEach(([childPromise, sideEffect]) => {
      sideEffect();

      childPromise.#rejectWith(this.#value);
    });

    this.#thenHandlersQueue = [];
    this.#finallyHandlersQueue = [];
  }
}

export default MyPromise;
