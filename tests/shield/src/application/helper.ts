/*
 * @Author: isaac.liu
 * @Date: 2019-06-28 16:16:14
 * Copyright © RingCentral. All rights reserved.
 */
import { ReactWrapper } from 'enzyme';
import { TestApp } from './application';
export { act } from 'react-dom/test-utils';

function helper(wrapper: ReactWrapper) {
  const p = new TestApp(wrapper);
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
