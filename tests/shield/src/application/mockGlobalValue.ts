/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-29 14:03:13
 * Copyright © RingCentral. All rights reserved.
 */
import { getGlobalValue } from '@/store/utils';
import { createMockEntity, createMultiFn, descriptorAOP } from '../core/utils';

function mockGlobalValue(data: any) {
  return function(
    target: any,
    property: string,
    descriptor: PropertyDescriptor,
  ) {
    const oldFn = descriptor.value;

    const _mockEntity = (args: any) => {
      const isEach = descriptor.value.isEach;
      (getGlobalValue as jest.Mock) = createMockEntity(data, args, isEach);
    };

    descriptor.value = descriptorAOP(target, _mockEntity, oldFn);
    return descriptor;
  };
}

mockGlobalValue.multi = function(data: any[]) {
  return function(
    target: any,
    property: string,
    descriptor: PropertyDescriptor,
  ) {
    const oldFn = descriptor.value;

    const _mockGlobalValue = () => {
      (getGlobalValue as jest.Mock) = createMultiFn(data);
    };

    descriptor.value = descriptorAOP(target, _mockGlobalValue, oldFn);
    return descriptor;
  };
};

export { mockGlobalValue };
