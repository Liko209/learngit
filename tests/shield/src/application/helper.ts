/*
 * @Author: isaac.liu
 * @Date: 2019-06-28 16:16:14
 * Copyright © RingCentral. All rights reserved.
 */
import { ReactElement } from 'react';
import { TestApp } from './application';
import { act as ract } from 'react-dom/test-utils';
import { getWrapper, WrapperType } from './wrapper';
import notificationCenter from 'sdk/service/notificationCenter';
import { service } from 'sdk';

type TestCallback = (() => void) | (() => Promise<void>);

function helper(element: ReactElement, type: WrapperType = WrapperType.Enzyme) {
  const p = new TestApp(getWrapper(element, type));
  notificationCenter.emitKVChange(service.SERVICE.STOP_LOADING);
  notificationCenter.emitKVChange(service.SERVICE.LOGIN);

  return p;
}

async function test<T>(app: TestApp<T>, callback: TestCallback) {
  if (app && callback) {
    app.flush();
    // @ts-ignore
    await act(callback);
    app.flush();
  }
}

function act(callback: TestCallback): Promise<void> {
  if (!callback) {
    return Promise.resolve();
  }
  return new Promise(resolve => {
    ract(() => {
      const result = callback();
      if (result && result.then) {
        result.then(resolve);
      } else {
        resolve();
      }
    });
  });
}

export { helper as h, test as t, act };
