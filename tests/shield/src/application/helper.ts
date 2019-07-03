/*
 * @Author: isaac.liu
 * @Date: 2019-06-28 16:16:14
 * Copyright © RingCentral. All rights reserved.
 */
import { ReactElement } from 'react';
import { TestApp } from './application';
export { act } from 'react-dom/test-utils';
import { getWrapper, WrapperType } from './wrapper';

function helper(element: ReactElement, type: WrapperType = WrapperType.React) {
  const p = new TestApp(getWrapper(element, type));
  return p;
}

// type JactCallback = (() => void) | (() => Promise<void>);

// function act(callback: JactCallback): Promise<void> {
//   if (!callback) {
//     return Promise.resolve();
//   }
//   return new Promise(resolve => {
//     ract(() => {
//       const result = callback();
//       if (result && result.then) {
//         result.then(resolve);
//       } else {
//         resolve();
//       }
//     });
//   });
// }

export { helper as h };
