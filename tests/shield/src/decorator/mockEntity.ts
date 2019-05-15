/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-22 14:31:22
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '@/store/utils';
import { createMockEntity, descriptorAOP, createMultiFn } from './utils';

function mockEntity(data: any) {
  return function (
    target: any,
    property: string,
    descriptor: PropertyDescriptor,
  ) {
    const oldFn = descriptor.value;
    const hasParam = oldFn.length > 0;

    const _mockEntity = (args: any) => {
      const isEach = descriptor.value.isEach;
      (getEntity as jest.Mock) = createMockEntity(data, args, isEach);
    };

    descriptor.value = descriptorAOP(hasParam, _mockEntity, oldFn);
    return descriptor;
  };
}

mockEntity.multi = function (data: any[]) {
  return function (
    target: any,
    property: string,
    descriptor: PropertyDescriptor,
  ) {
    const oldFn = descriptor.value;
    const hasParam = oldFn.length > 0;

    const _mockEntity = () => {
      (getEntity as jest.Mock) = createMultiFn(data);
    };

    descriptor.value = descriptorAOP(hasParam, _mockEntity, oldFn);
    return descriptor;
  };
};

export { mockEntity };
