/*
 * @Author: isaac.liu
 * @Date: 2019-06-28 16:16:14
 * Copyright © RingCentral. All rights reserved.
 */
import { ReactWrapper } from 'enzyme';
import { act as ract } from 'react-dom/test-utils';
import { TestApp } from './application';

function helper(wrapper: ReactWrapper) {
  const p = new TestApp(wrapper);
  return p;
}

type JactCallback = (() => void) | (() => Promise<void>);

function act(callback: JactCallback): Promise<void> {
  if (!callback) {
    return Promise.resolve();
  }
  return new Promise(resolve => {
    ract(() => {
      const result = callback();
      if (result instanceof Promise) {
        result.then(resolve);
      } else {
        resolve();
      }
    });
  });
}

export { helper as h, act };
