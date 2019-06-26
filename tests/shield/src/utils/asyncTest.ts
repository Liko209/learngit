/*
 * @Author: isaac.liu
 * @Date: 2019-06-26 16:26:57
 * Copyright © RingCentral. All rights reserved.
 */

function asyncTest(func: Function, timeout = 0): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      func && func();
      resolve();
    },         timeout);
  });
}

export { asyncTest };
