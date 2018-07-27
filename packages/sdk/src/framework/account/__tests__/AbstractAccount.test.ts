import { AbstractAccount } from '../AbstractAccount';
class MyAccount extends AbstractAccount {
  init(data: any): Promise<void> {
    return;
  }
}

describe('AbstractAccount', () => {
  describe('getSupportedServices()', () => {
    it('should work', () => {
      const account = new MyAccount();
      const services = account.getSupportedServices();
      expect(services).toHaveLength(0);
    });
  });

  describe('setSupportedServices()', () => {
    it('should emit supported service change event', () => {
      const account = new MyAccount();
      const mockFn = jest.fn();
      account.on(MyAccount.EVENT_SUPPORTED_SERVICE_CHANGE, mockFn);
      account.setSupportedServices(['AService', 'BService']);
      expect(mockFn).toHaveBeenCalledWith(['AService', 'BService'], true);
      account.setSupportedServices([]);
      expect(mockFn).toHaveBeenCalledWith(['AService', 'BService'], false);
    });
  });
});
