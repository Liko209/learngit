/*
 * @Author: isaac.liu
 * @Date: 2019-06-28 16:16:14
 * Copyright © RingCentral. All rights reserved.
 */
import { ReactWrapper } from 'enzyme';
import { TestApp } from './application';

function helper(wrapper: ReactWrapper) {
  const p = new TestApp(wrapper);
  return p;
}

export { helper as h };
