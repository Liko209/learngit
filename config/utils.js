/*
 * @Author: isaac.liu
 * @Date: 2019-07-26 09:38:46
 * Copyright © RingCentral. All rights reserved.
 */

function copyProps(src, target) {
  Object.defineProperties(target, {
    ...Object.getOwnPropertyDescriptors(src),
    ...Object.getOwnPropertyDescriptors(target),
  });
}

// Create a localStorage and sessionStorage at window
class FakeStorage {
  store = {};
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = value.toString();
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
  get length() {
    return Object.keys(this.store).length;
  }
}

const wrapFunction = (func, options = {}) => {
  const { before, after } = options;
  const rawFunc = func;
  const wrapped = (...params) => {
    before && before(...params);
    const result = rawFunc(...params);
    return after ? after(result, ...params) : result;
  };
  return wrapped;
};

module.exports = {
  copyProps,
  FakeStorage,
  wrapFunction,
};
