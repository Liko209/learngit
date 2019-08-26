/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-07-26 10:50:57
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework/ioc';
import { descriptorAOP } from '../core/utils';
import { mockMethods } from '../shared';

const mockContainerCache = new Map();
type MockMethod = { method: string; data: any; type?: 'resolve' | 'reject' };
type MockMethodType = string | MockMethod[];

const _getMockInstance = function(
  key: any,
  methods?: MockMethodType,
  mockData?: any,
  methodType?: 'resolve' | 'reject',
) {
  // we don't use real instance only fake a object
  const instance = typeof key === 'function' ? {} : key;

  if (Array.isArray(methods)) {
    methods.forEach(({ method, data, type }) => {
      mockMethods(instance, method, data, type);
    });
  } else if (typeof methods === 'string') {
    mockMethods(instance, methods, mockData, methodType);
  } else {
    // we shouldn't use @mockService(service)
    // throw Error('methods must be array or string');
  }

  return {
    name: key,
    service: instance,
  };
};

const _mockContainer = function(
  key: any,
  method?: MockMethodType,
  mockData?: any,
  methodType?: 'resolve' | 'reject',
) {
  const getInstance = _getMockInstance(key, method, mockData, methodType);
  const name = typeof key === 'function' ? key : key.name;

  mockContainerCache.set(name, getInstance.service);

  container.get = jest.fn().mockImplementation((serviceName: string) => {
    if (mockContainerCache.get(serviceName)) {
      return mockContainerCache.get(serviceName);
    }
    return null;
  });
};

const _fakeInstance = function(
  key: any,
  method?: MockMethodType,
  mockData?: any,
  methodType?: 'resolve' | 'reject',
) {
  return function(
    target: any,
    property: string,
    descriptor: PropertyDescriptor,
  ) {
    const oldFn = descriptor.value;

    const _mockService = () => {
      _mockContainer(key, method, mockData, methodType);
    };

    descriptor.value = descriptorAOP(target, _mockService, oldFn);
    return descriptor;
  };
};

function mockContainer(
  mockObject: any,
  method: MockMethodType,
  mockData?: any,
) {
  return _fakeInstance(mockObject, method, mockData);
}

const _enhanceMethod = (methods: MockMethod[], type: 'resolve' | 'reject') => {
  return methods.map((method: MockMethod) => {
    return {
      ...method,
      type: method.type || type,
    };
  });
};

mockContainer.resolve = function(
  mockObject: any,
  methods: MockMethodType,
  mockData?: any,
) {
  const enhanceMethods = Array.isArray(methods)
    ? _enhanceMethod(methods, 'resolve')
    : methods;
  return _fakeInstance(mockObject, enhanceMethods, mockData, 'resolve');
};

mockContainer.reject = function(
  mockObject: any,
  methods: MockMethodType,
  mockData?: any,
) {
  const enhanceMethods = Array.isArray(methods)
    ? _enhanceMethod(methods, 'reject')
    : methods;
  return _fakeInstance(mockObject, enhanceMethods, mockData, 'reject');
};

export { mockContainer };
