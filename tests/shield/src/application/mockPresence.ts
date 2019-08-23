/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-07-25 01:48:27
 * Copyright © RingCentral. All rights reserved.
 */

import { getPresence } from '@/store/utils';
import { descriptorAOP } from '../core/utils';

function mockPresence(data: any) {
  return function(
    target: any,
    property: string,
    descriptor: PropertyDescriptor,
  ) {
    const oldFn = descriptor.value;

    const _mockPresence = (args: any) => {
      (getPresence as jest.Mock) = jest.fn().mockReturnValue(data);
    };

    descriptor.value = descriptorAOP(target, _mockPresence, oldFn);
    return descriptor;
  };
}

export { mockPresence };
