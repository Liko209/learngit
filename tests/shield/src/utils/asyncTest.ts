/*
 * @Author: isaac.liu
 * @Date: 2019-06-26 16:26:57
 * Copyright © RingCentral. All rights reserved.
 */

type TestFunc = Function | (() => Promise<void>);

function asyncTest(func: TestFunc, timeout = 0): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      if (func) {
        const result = func();
        if (result instanceof Promise) {
          result.then(resolve);
        } else {
          resolve();
        }
      } else {
        resolve();
      }
    },         timeout);
  });
}

export { asyncTest };
