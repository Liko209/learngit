/*
 * @Author: isaac.liu
 * @Date: 2019-06-28 16:16:14
 * Copyright © RingCentral. All rights reserved.
 */
import { ReactWrapper } from 'enzyme';

type ResolverMap = {
  [key: string]: (wrapper: ReactWrapper) => any;
};

function findByAutomationID(wrapper: ReactWrapper, id: string) {
  return helper(wrapper.find({ 'data-test-automation-id': id }));
}

const kResolvers: ResolverMap = {
  leftRail: (wrapper: ReactWrapper) => findByAutomationID(wrapper, 'leftRail'),
};

const handler = {
  get: (target: ReactWrapper, name: string) => {
    const resolver = kResolvers[name];
    if (resolver) {
      return resolver(target);
    }
    return target[name];
  },
};

function helper(wrapper: ReactWrapper) {
  const p = new Proxy(wrapper, handler);
  return p;
}

export { helper as h };
