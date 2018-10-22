import serviceManager from '../serviceManager';
import BaseService from '../BaseService';

const SERVICE_NAME = 'a';

class A extends BaseService {
  static serviceName = SERVICE_NAME;
}

beforeEach(() => {
  serviceManager.destroy();
});

it('getInstance()', () => {
  const instance1 = serviceManager.getInstance(A);
  expect(instance1).toBeInstanceOf(A);
});

it('destroy()', () => {
  serviceManager.getInstance(A);
  expect(serviceManager.size).toBeGreaterThan(0);
  serviceManager.destroy();
  expect(serviceManager.size).toBe(0);
});
