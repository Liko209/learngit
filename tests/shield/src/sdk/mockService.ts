import { ServiceLoader } from 'sdk/module/serviceLoader';
import { registerConfigs } from 'sdk/registerConfigs';
import { descriptorAOP } from '../core/utils';

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

const _getMockService = function (
  mockObject: any,
  methods?: MockMethodType,
  mockData?: any,
  methodType?: 'resolve' | 'reject',
) {
  const { name, value: Service } = mockObject;
  // we don't use real Service only fake a object
  const serviceClass = Service ? {} : mockObject;

  if (Array.isArray(methods)) {
    methods.forEach(({ method, data, type }) => {
      _mockMethod(serviceClass, method, data, type);
    });
  } else if (typeof methods === 'string') {
    _mockMethod(serviceClass, methods, mockData, methodType);
  } else {
    // we shouldn't use @mockService(service)
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
function mockService(mockObject: any, method: MockMethodType, mockData?: any) {
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
  methods: MockMethodType,
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
  methods: MockMethodType,
  mockData?: any,
) {
  const enhanceMethods = Array.isArray(methods)
    ? _enhanceMethod(methods, 'reject')
    : methods;
  return _fakeService(mockObject, enhanceMethods, mockData, 'reject');
};

export { mockService };
