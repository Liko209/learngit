/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-05-04 22:13:09
 * Copyright © RingCentral. All rights reserved.
 */

function createMockEntity(data: any, args: any, isEach?: boolean) {
  return jest.fn().mockImplementation((...entityArgs) => {
    const dataIsFunction = typeof data === 'function';
    if (dataIsFunction) {
      return isEach ? data(...args, ...entityArgs) : data(...entityArgs);
    }
    return data;
  });
}

function createMultiFn(data: any[]) {
  let mockFn = jest.fn();
  data.forEach(mock => {
    mockFn = mockFn.mockImplementationOnce(
      typeof mock === 'function' ? mock : () => mock,
    );
  });
  return mockFn;
}

function descriptorAOP(hasParam: boolean, before: Function, oldFn: Function) {
  return hasParam
    ? function (args: jest.DoneCallback | Object) {
        before(args);
        return oldFn.call(null, args);
      }
    : function () {
        before(arguments);
        return oldFn.apply(null, arguments);
      };
}

export { createMockEntity, createMultiFn, descriptorAOP };
