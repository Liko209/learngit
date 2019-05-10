import { ServiceLoader } from 'sdk/module/serviceLoader';
import { registerConfigs } from 'sdk/registerConfigs';
import { descriptorAOP } from './utils';

const mockServiceCache = new Map();
type MockMethod = { method: string; data: any; type?: 'resolve' | 'reject' };
type MockMethodType = string | MockMethod[];

const _mockMethod = function (
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

  mockObject[method] = jest.fn().mockImplementation((...args) => {
    if (methodType === 'resolve') {
      return Promise.resolve(fakeData(...args));
    }
    if (methodType === 'reject') {
      return Promise.reject(fakeData(...args));
    }
    return fakeData(...args);
  });
};

const _getMockService = function (
  mockObject: any,
  methods?: MockMethodType,
  mockData?: any,
  methodType?: 'resolve' | 'reject',
) {
  const { name, value: Service } = mockObject;
  let serviceClass: any;
  if (Service) {
    serviceClass = new Service();
  }

  if (Array.isArray(methods)) {
    methods.forEach(({ method, data, type }) => {
      _mockMethod(serviceClass || mockObject, method, data, type);
    });
  } else if (typeof methods === 'string') {
    _mockMethod(serviceClass || mockObject, methods, mockData, methodType);
  } else {
    // throw Error('methods must be array or string');
  }

  return {
    name,
    service: serviceClass || mockObject,
  };
};

const _mockServiceClass = function (
  ServiceClass: any,
  method?: MockMethodType,
  mockData?: any,
  methodType?: 'resolve' | 'reject',
) {
  const { name, service } = _getMockService(
    ServiceClass,
    method,
    mockData,
    methodType,
  );
  mockServiceCache.set(name, service);

  ServiceLoader.getInstance = jest
    .fn()
    .mockImplementation((serviceName: string) => {
      if (mockServiceCache.get(serviceName)) {
        return mockServiceCache.get(serviceName);
      }
      return null;
    });
};

const _fakeService = function (
  mockObject: any,
  method?: MockMethodType,
  mockData?: any,
  methodType?: 'resolve' | 'reject',
) {
  return function (
    target: any,
    property: string,
    descriptor: PropertyDescriptor,
  ) {
    const oldFn = descriptor.value;
    const hasParam = oldFn.length > 0;

    const _mockService = () => {
      const ServiceClass = registerConfigs.classes.find(
        item => item.value === mockObject,
      );
      _mockServiceClass(
        ServiceClass || mockObject,
        method,
        mockData,
        methodType,
      );
    };

    descriptor.value = descriptorAOP(hasParam, _mockService, oldFn);
    return descriptor;
  };
};

/**
 * decorator test function use mock service
 * @param mockObject Service Class or service instance(instance must be set name)
 * @param method string or method[]
 * @param mockData return any type data
 *
 * ### Example
```javascript
// Service Class
@mockService(PostService, 'addTeamMembers')
testFunction() {}

// service instance
const groupService = {
  name: ServiceConfig.GROUP_SERVICE, // must be set service name
  createTeam() {},
};

@mockService(groupService, 'createTeam')
testFunction() {}
```

### method is array
```javascript
// Service Class
@mockService(groupService, [
  {
    method: 'createTeam',
    data: 'result',
  },
])
testFunction() {}
```
 */
function mockService(mockObject: any, method?: MockMethodType, mockData?: any) {
  return _fakeService(mockObject, method, mockData);
}

const _enhanceMethod = (methods: MockMethod[], type: 'resolve' | 'reject') => {
  return methods.map((method: MockMethod) => {
    return {
      ...method,
      type: method.type || type,
    };
  });
};

/**
 * decorator test function use mock service
 * @param mockObject Service Class or service instance(instance must be set name)
 * @param method string or method[]
 * @param mockData return any type data
 *
 * ### Example
```javascript
// Service Class
@mockService.resolve(PostService, 'addTeamMembers')
testFunction() {}
```
 */
mockService.resolve = function (
  mockObject: any,
  methods?: MockMethodType,
  mockData?: any,
) {
  const enhanceMethods = Array.isArray(methods)
    ? _enhanceMethod(methods, 'resolve')
    : methods;
  return _fakeService(mockObject, enhanceMethods, mockData, 'resolve');
};

/**
 * decorator test function use mock service
 * @param mockObject Service Class or service instance(instance must be set name)
 * @param method string or method[]
 * @param mockData return any type data
 *
 * ### Example
```javascript
// Service Class
@mockService.reject(PostService, 'addTeamMembers')
testFunction() {}
```
 */
mockService.reject = function (
  mockObject: any,
  methods?: MockMethodType,
  mockData?: any,
) {
  const enhanceMethods = Array.isArray(methods)
    ? _enhanceMethod(methods, 'reject')
    : methods;
  return _fakeService(mockObject, enhanceMethods, mockData, 'reject');
};

export { mockService };
