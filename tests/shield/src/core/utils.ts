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

function descriptorAOP(target: any, before: Function, oldFn: Function) {
  const fnLen = oldFn.length;

  switch (fnLen) {
    case 1:
      return function(done: jest.DoneCallback) {
        before(done);
        return oldFn.call(target, done);
      };
    case 2:
      return function(data: any, done: jest.DoneCallback) {
        before(data, done);
        return oldFn.call(target, data, done);
      };
    default:
      return function() {
        before(arguments);
        return oldFn.apply(target, arguments);
      };
  }
}

export { createMockEntity, createMultiFn, descriptorAOP };
