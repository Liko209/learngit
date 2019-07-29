/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-07-26 18:39:37
 * Copyright © RingCentral. All rights reserved.
 */

const mockMethods = function(
  mockObject: any,
  method: string,
  mockData?: any,
  methodType?: 'resolve' | 'reject',
) {
  const fakeData = (...args: any[]) => {
    const dataIsFunction = typeof mockData === 'function';
    if (dataIsFunction) {
      return mockData(...args);
    }
    return mockData;
  };

  const mockImplementation = (...args: any[]) => {
    if (methodType === 'resolve') {
      return Promise.resolve(fakeData(...args));
    }
    if (methodType === 'reject') {
      return Promise.reject(fakeData(...args));
    }
    return fakeData(...args);
  };
  const [methodName, accessType] = method.split('.');

  if (accessType) {
    const base = {
      enumerable: true,
      configurable: true,
    };
    if (accessType === 'get') {
      Object.defineProperty(mockObject, methodName, {
        ...base,
        get() {
          return fakeData(null);
        },
      });
    } else if (accessType === 'set') {
      Object.defineProperty(mockObject, methodName, {
        ...base,
        set: fakeData,
      });
    } else {
      throw new Error('accessType must be get or set');
    }
    jest
      .spyOn(mockObject, methodName, accessType as any)
      .mockImplementation(mockImplementation);
  } else {
    mockObject[method] = jest.fn().mockImplementation(mockImplementation);
  }
};

export { mockMethods };
