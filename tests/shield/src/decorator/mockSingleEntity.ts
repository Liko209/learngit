/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-29 14:03:13
 * Copyright © RingCentral. All rights reserved.
 */
import { getSingleEntity } from '@/store/utils';
import { createMockEntity, createMultiFn, descriptorAOP } from './utils';

function mockSingleEntity(data: any) {
  return function (
    target: any,
    property: string,
    descriptor: PropertyDescriptor,
  ) {
    const oldFn = descriptor.value;
    const hasParam = oldFn.length > 0;

    const _mockEntity = (args: any) => {
      const isEach = descriptor.value.isEach;
      (getSingleEntity as jest.Mock) = createMockEntity(data, args, isEach);
    };

    descriptor.value = descriptorAOP(hasParam, _mockEntity, oldFn);
    return descriptor;
  };
}

mockSingleEntity.multi = function (data: any[]) {
  return function (
    target: any,
    property: string,
    descriptor: PropertyDescriptor,
  ) {
    const oldFn = descriptor.value;
    const hasParam = oldFn.length > 0;

    const _mockGlobalValue = () => {
      (getSingleEntity as jest.Mock) = createMultiFn(data);
    };

    descriptor.value = descriptorAOP(hasParam, _mockGlobalValue, oldFn);
    return descriptor;
  };
};

export { mockSingleEntity };
