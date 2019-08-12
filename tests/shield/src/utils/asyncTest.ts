/*
 * @Author: isaac.liu
 * @Date: 2019-06-26 16:26:57
 * Copyright © RingCentral. All rights reserved.
 */

type TestFunc = Function | (() => Promise<void>);

function wait(duration = 0) {
  return new Promise(resolve => setTimeout(resolve, duration));
}

async function waitDone(func: Function) {
  func && func();
  await wait();
}

function asyncTest(func: TestFunc, timeout = 0): Promise<void> {
  return wait(timeout).then(() => {
    if (func) {
      const result = func();
      if (result instanceof Promise) {
        result.then();
      }
    }
  });
}

function delay(func: Function, delay: number = 0) {
  return wait(delay).then(() => func());
}

export { asyncTest, wait, waitDone, delay };
