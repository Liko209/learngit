import { RCAccount } from '../RCAccount';

describe('RCAccount', () => {
  describe('updateSupportedServices()', () => {
    it('should set supported services', () => {
      const rcAccount = new RCAccount();
      jest.spyOn(rcAccount, 'setSupportedServices');
      rcAccount.updateSupportedServices(null);
      expect(rcAccount.setSupportedServices).toHaveBeenCalled();
    });
  });
});
